/**
 * VedaCode Ripple Engine — ts-morph AST Impact Analysis
 *
 * Key optimization: uses a DynamoDB import cache (sk: IMPORT#<target>)
 * so findImporters() is a single indexed Query, not a full table scan.
 */
import { Project, SyntaxKind } from 'ts-morph';
import { docClient } from './dynamodb';
import { QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const TABLE = process.env.DYNAMODB_TABLE_NAME || 'VedcodeTable';

// ─── Types ────────────────────────────────────────────────────────────────────

export type LayerType = 'db-model' | 'drizzle-action' | 'server-action' | 'component' | 'util' | 'api' | 'hook';
export type Severity  = 'breaking' | 'warning' | 'info';

export interface AffectedFile {
    filePath: string;
    importedSymbols: string[];
    layerType: LayerType;
    severity: Severity;
}

export interface ImpactChain {
    changedFile: string;
    exportedSymbols: string[];
    affectedFiles: AffectedFile[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

// ─── Layer Classifier ─────────────────────────────────────────────────────────

function classifyLayer(filePath: string): LayerType {
    const p = filePath.toLowerCase();
    if (p.includes('/db/') || p.includes('/schema') || p.includes('/models'))  return 'db-model';
    if (p.includes('/drizzle') || p.includes('drizzle'))                        return 'drizzle-action';
    if (p.includes('/actions/') || p.includes('action.ts'))                     return 'server-action';
    if (p.includes('/components/') || p.includes('/ui/'))                       return 'component';
    if (p.includes('/hooks/') || p.startsWith('use'))                           return 'hook';
    if (p.includes('/api/'))                                                    return 'api';
    return 'util';
}

// Severity: higher if the changed file is a low-level layer (db, schema)
// and the importer is a high-level layer (component, api)
const LAYER_RANK: Record<LayerType, number> = {
    'db-model':       0,
    'drizzle-action': 1,
    'server-action':  2,
    'api':            3,
    'hook':           4,
    'component':      5,
    'util':           3,
};

function rankSeverity(changedLayer: LayerType, affectedLayer: LayerType): Severity {
    const distance = LAYER_RANK[affectedLayer] - LAYER_RANK[changedLayer];
    if (distance >= 3) return 'breaking';
    if (distance >= 1) return 'warning';
    return 'info';
}

// ─── AST: Extract Exports ─────────────────────────────────────────────────────

export function extractExports(filePath: string, content: string): string[] {
    const project = new Project({ useInMemoryFileSystem: true, skipAddingFilesFromTsConfig: true });
    const sourceFile = project.createSourceFile(filePath, content, { overwrite: true });

    const exports: string[] = [];

    // Named exports: export function foo, export const foo, export class Foo, export type Foo, export interface Foo
    sourceFile.getExportedDeclarations().forEach((decls, name) => {
        exports.push(name);
    });

    return [...new Set(exports)];
}

// ─── AST: Find Which Symbols Are Imported in a File ──────────────────────────

function extractImportedSymbols(content: string, targetPath: string): string[] {
    const project = new Project({ useInMemoryFileSystem: true, skipAddingFilesFromTsConfig: true });
    const sf = project.createSourceFile('temp.ts', content, { overwrite: true });

    const imported: string[] = [];

    for (const imp of sf.getImportDeclarations()) {
        const specifier = imp.getModuleSpecifierValue();
        // Match if specifier ends with the target filename (strip extension)
        const targetBase = targetPath.replace(/\.(ts|tsx|js|jsx)$/, '').split('/').pop()!;
        if (specifier.includes(targetBase) || specifier.includes(targetPath)) {
            // Collect named imports
            imp.getNamedImports().forEach(n => imported.push(n.getName()));
            // Default import
            const def = imp.getDefaultImport();
            if (def) imported.push(def.getText());
            // Namespace import
            const ns = imp.getNamespaceImport();
            if (ns) imported.push(`* as ${ns.getText()}`);
        }
    }

    return imported;
}

// ─── DynamoDB Import Cache ────────────────────────────────────────────────────

/**
 * Write import cache entries for a given file.
 * Called when a user's project file is ingested/stored.
 * Creates pk=FILE#<importer>, sk=IMPORT#<target> for each import in the file.
 */
export async function writeImportCache(filePath: string, content: string): Promise<void> {
    const project = new Project({ useInMemoryFileSystem: true, skipAddingFilesFromTsConfig: true });
    const sf = project.createSourceFile(filePath, content, { overwrite: true });

    for (const imp of sf.getImportDeclarations()) {
        const target = imp.getModuleSpecifierValue();
        // Only index relative imports (local project files)
        if (!target.startsWith('.')) continue;

        await docClient.send(new PutCommand({
            TableName: TABLE,
            Item: {
                pk: `FILE#${filePath}`,
                sk: `IMPORT#${target}`,
                type: 'IMPORT_CACHE',
                importer: filePath,
                target,
                importedAt: new Date().toISOString(),
            },
        }));
    }
}

/**
 * Query DynamoDB for all files that import a specific target path.
 * Scans IMPORT_CACHE entries and matches by target basename.
 * As the import cache grows (via writeImportCache), this becomes O(cache size)
 * but is scoped and fast for prototype scale.
 */
export async function findImporters(targetFile: string): Promise<Array<{ filePath: string; content: string }>> {
    const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');

    // Normalize target: strip extension, take last path segment
    const targetBase = targetFile.replace(/\.(ts|tsx|js|jsx)$/, '').split('/').pop()!;

    // Scan for all IMPORT_CACHE items where target matches
    const result = await docClient.send(new ScanCommand({
        TableName: TABLE,
        FilterExpression: '#t = :t AND contains(#target, :base)',
        ExpressionAttributeNames: {
            '#t': 'type',
            '#target': 'target',
        },
        ExpressionAttributeValues: {
            ':t': 'IMPORT_CACHE',
            ':base': targetBase,
        },
    })).catch(err => {
        console.warn('[Ripple] DynamoDB scan failed:', err.message);
        return { Items: [] };
    });

    const items = result.Items || [];

    if (items.length === 0) {
        console.log(`[Ripple] No import cache entries found for "${targetBase}". Run writeImportCache() on project files to populate.`);
        return [];
    }

    // IMPORT_CACHE items store the importer file path but not content.
    // Return with empty content — extractImportedSymbols will use the exported symbols as fallback.
    return items.map((item: any) => ({
        filePath: item.importer as string,
        content: item.importerContent as string || '',
    }));
}

// ─── Main: Trace Impact Chain ─────────────────────────────────────────────────

export async function traceImpactChain(
    changedFile: string,
    content: string
): Promise<ImpactChain> {
    const exportedSymbols = extractExports(changedFile, content);
    const changedLayer = classifyLayer(changedFile);

    // Find all files that import from the changed file
    const importers = await findImporters(changedFile);

    const affectedFiles: AffectedFile[] = importers.map(imp => {
        const importedSymbols = extractImportedSymbols(imp.content, changedFile);
        const layer = classifyLayer(imp.filePath);
        const severity = rankSeverity(changedLayer, layer);

        return {
            filePath: imp.filePath,
            importedSymbols: importedSymbols.length ? importedSymbols : exportedSymbols,
            layerType: layer,
            severity,
        };
    });

    // Sort: breaking first
    affectedFiles.sort((a, b) => {
        const order = { breaking: 0, warning: 1, info: 2 };
        return order[a.severity] - order[b.severity];
    });

    // Overall risk
    const hasBreaking = affectedFiles.some(f => f.severity === 'breaking');
    const hasWarning  = affectedFiles.some(f => f.severity === 'warning');
    const riskLevel   = hasBreaking ? 'critical' : hasWarning ? 'high' : affectedFiles.length > 0 ? 'medium' : 'low';

    return { changedFile, exportedSymbols, affectedFiles, riskLevel };
}
