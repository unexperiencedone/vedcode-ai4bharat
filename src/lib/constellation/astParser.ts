/**
 * Multi-language Analyzer for ProjectConstellation.
 *
 * Strategy:
 *  - TypeScript / JavaScript → ts-morph (full AST: real complexity + typed imports)
 *  - All other languages     → regex-based (line count, keyword complexity, import regex)
 *
 * Both paths produce the same ConstellationNodeData shape.
 */

import { Project, ScriptKind, SyntaxKind } from 'ts-morph';
import path from 'path';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ConstellationNodeData {
    id: string;
    filePath: string;
    language: string;
    lineCount: number;
    importCount: number;
    exportCount: number;
    complexity: number;
    luminosity: number; // 0–1, normalised across all files
    gravity: number;    // inbound import count
    nodeType: 'component' | 'api' | 'lib' | 'schema' | 'other';
    solarSystem: string; // first path segment
    imports: string[];   // resolved relative import paths
    explanation?: string; // Concept explanation mapping for Knowledge Map
}

// ── Constants ─────────────────────────────────────────────────────────────────

const JS_TS_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

// ── Language detection ────────────────────────────────────────────────────────

const EXT_LANG: Record<string, string> = {
    '.ts': 'TypeScript', '.tsx': 'TypeScript', '.js': 'JavaScript',
    '.jsx': 'JavaScript', '.mjs': 'JavaScript', '.cjs': 'JavaScript',
    '.py': 'Python', '.pyx': 'Python', '.pyw': 'Python',
    '.go': 'Go',
    '.rs': 'Rust',
    '.java': 'Java', '.kt': 'Kotlin', '.kts': 'Kotlin',
    '.cs': 'C#', '.fs': 'F#',
    '.rb': 'Ruby', '.rake': 'Ruby',
    '.php': 'PHP',
    '.c': 'C', '.h': 'C',
    '.cpp': 'C++', '.cc': 'C++', '.cxx': 'C++', '.hpp': 'C++',
    '.swift': 'Swift',
    '.scala': 'Scala', '.groovy': 'Groovy',
    '.vue': 'Vue', '.svelte': 'Svelte',
    '.dart': 'Dart',
    '.sh': 'Shell', '.bash': 'Shell', '.zsh': 'Shell',
    '.ex': 'Elixir', '.exs': 'Elixir',
    '.erl': 'Erlang',
    '.hs': 'Haskell',
    '.lua': 'Lua',
};

function getLanguage(filePath: string): string {
    return EXT_LANG[path.extname(filePath).toLowerCase()] ?? 'Other';
}

// ── Classification ────────────────────────────────────────────────────────────

function classifyNode(filePath: string): ConstellationNodeData['nodeType'] {
    const p = filePath.toLowerCase();
    if (
        p.includes('/components/') || p.includes('/views/') || p.includes('/widgets/') ||
        p.includes('/ui/') ||
        p.endsWith('page.tsx') || p.endsWith('layout.tsx') || p.endsWith('.vue') || p.endsWith('.svelte')
    ) return 'component';
    if (
        p.includes('/api/') || p.includes('/routes/') || p.includes('/controllers/') ||
        p.includes('/handlers/') ||
        p.endsWith('route.ts') || p.endsWith('route.js') || p.endsWith('_pb.go')
    ) return 'api';
    if (
        p.includes('/lib/') || p.includes('/libs/') || p.includes('/utils/') ||
        p.includes('/helpers/') || p.includes('/services/') || p.includes('/pkg/') ||
        p.includes('/internal/')
    ) return 'lib';
    if (
        p.includes('schema') || p.includes('/db/') || p.includes('/models/') ||
        p.includes('/migrations/') || p.includes('/entities/')
    ) return 'schema';
    return 'other';
}

function getSolarSystem(filePath: string): string {
    return filePath.split('/')[0] || 'root';
}

// ── Per-language regex patterns ───────────────────────────────────────────────

interface LangPattern {
    imports: RegExp[];      // each regex's capture group 1 = module path
    complexity: RegExp[];   // each line matching ANY of these contributes +1
}

const LANG_PATTERNS: Record<string, LangPattern> = {
    Python: {
        imports: [/^from\s+([\w.]+)\s+import/gm, /^import\s+([\w.,\s]+)/gm],
        complexity: [/\bif\b/, /\belif\b/, /\bfor\b/, /\bwhile\b/, /\bexcept\b/, /\bwith\b/, /\blambda\b/],
    },
    Go: {
        imports: [/import\s+"([\w./]+)"/g, /import\s+\w+\s+"([\w./]+)"/g],
        complexity: [/\bif\b/, /\bfor\b/, /\bswitch\b/, /\bcase\b/, /\bselect\b/],
    },
    Rust: {
        imports: [/\buse\s+([\w:{}*,\s]+);/g],
        complexity: [/\bif\b/, /\bmatch\b/, /\bloop\b/, /\bwhile\b/, /\bfor\b/],
    },
    Java: {
        imports: [/^import\s+([\w.]+);/gm],
        complexity: [/\bif\b/, /\bfor\b/, /\bwhile\b/, /\bswitch\b/, /\bcatch\b/],
    },
    Kotlin: {
        imports: [/^import\s+([\w.]+)/gm],
        complexity: [/\bif\b/, /\bwhen\b/, /\bfor\b/, /\bwhile\b/, /\bcatch\b/],
    },
    'C#': {
        imports: [/^using\s+([\w.]+);/gm],
        complexity: [/\bif\b/, /\bfor\b/, /\bforeach\b/, /\bwhile\b/, /\bswitch\b/, /\bcatch\b/],
    },
    Ruby: {
        imports: [/\brequire(?:_relative)?\s+['"]([^'"]+)['"]/gm],
        complexity: [/\bif\b/, /\bunless\b/, /\bwhile\b/, /\beach\b/, /\brescue\b/, /\bcase\b/],
    },
    PHP: {
        imports: [/(?:require|include)(?:_once)?\s*['"]([^'"]+)['"]/gm, /^use\s+([\w\\]+)/gm],
        complexity: [/\bif\b/, /\bfor\b/, /\bforeach\b/, /\bwhile\b/, /\bswitch\b/, /\bcatch\b/],
    },
    C: {
        imports: [/#include\s*[<"]([\w/.-]+)[>"]/g],
        complexity: [/\bif\b/, /\bfor\b/, /\bwhile\b/, /\bswitch\b/, /\bgoto\b/],
    },
    'C++': {
        imports: [/#include\s*[<"]([\w/.-]+)[>"]/g],
        complexity: [/\bif\b/, /\bfor\b/, /\bwhile\b/, /\bswitch\b/, /\bcatch\b/, /\btemplate\b/],
    },
    Swift: {
        imports: [/^import\s+([\w.]+)/gm],
        complexity: [/\bif\b/, /\bguard\b/, /\bswitch\b/, /\bfor\b/, /\bwhile\b/, /\bcatch\b/],
    },
    Scala: {
        imports: [/^import\s+([\w.{}*]+)/gm],
        complexity: [/\bif\b/, /\bmatch\b/, /\bfor\b/, /\bwhile\b/, /\bcatch\b/],
    },
    Dart: {
        imports: [/^import\s+'([^']+)'/gm, /^import\s+"([^"]+)"/gm],
        complexity: [/\bif\b/, /\bfor\b/, /\bwhile\b/, /\bswitch\b/, /\bcatch\b/],
    },
    Elixir: {
        imports: [/^\s*(?:import|alias|use|require)\s+([\w.]+)/gm],
        complexity: [/\bif\b/, /\bcase\b/, /\bcond\b/, /\bwith\b/, /\btry\b/],
    },
    Vue: {
        imports: [/import\s+.*?from\s+['"]([^'"]+)['"]/g],
        complexity: [/\bif\b/, /\bv-if\b/, /\bv-for\b/, /\bcomputed\b/, /\bwatch\b/],
    },
    Svelte: {
        imports: [/import\s+.*?from\s+['"]([^'"]+)['"]/g],
        complexity: [/\bif\b/, /\b\{#if\b/, /\b\{#each\b/, /\b\{#await\b/],
    },
    Haskell: {
        imports: [/^import\s+(?:qualified\s+)?([\w.]+)/gm],
        complexity: [/\bif\b/, /\bcase\b/, /\bwhere\b/, /\bguard\b/, /\bdo\b/],
    },
    Lua: {
        imports: [/\brequire\s*\(?['"]([^'"]+)['"]\)?/g],
        complexity: [/\bif\b/, /\bfor\b/, /\bwhile\b/, /\brepeat\b/, /\bfunction\b/],
    },
    Shell: {
        imports: [/(?:source|\.)\s+([\w./]+)/g],
        complexity: [/\bif\b/, /\bfor\b/, /\bwhile\b/, /\bcase\b/, /\buntil\b/],
    },
};

const DEFAULT_PATTERN: LangPattern = {
    imports: [/(?:import|require|include|use|from)\s+['"]([^'"]+)['"]/g],
    complexity: [/\bif\b/, /\bfor\b/, /\bwhile\b/, /\bswitch\b/, /\bmatch\b/],
};

// ── Regex-based file analysis ─────────────────────────────────────────────────

function analyzeFileRegex(
    filePath: string,
    content: string,
    language: string
): Omit<ConstellationNodeData, 'luminosity' | 'gravity'> {
    const lines = content.split('\n');
    const pattern = LANG_PATTERNS[language] ?? DEFAULT_PATTERN;

    // Cyclomatic complexity proxy: 1 + keyword hits per line
    let complexity = 1;
    for (const line of lines) {
        for (const re of pattern.complexity) {
            if (re.test(line)) { complexity++; break; }
        }
    }

    // Extract all import strings
    const rawImports: string[] = [];
    for (const importRe of pattern.imports) {
        const re = new RegExp(importRe.source, importRe.flags.includes('g') ? importRe.flags : importRe.flags + 'g');
        let m: RegExpExecArray | null;
        while ((m = re.exec(content)) !== null) {
            if (m[1]) rawImports.push(m[1].trim());
        }
    }

    // Keep everything, not just "./relative" imports — most non-JS languages write
    // intra-repo imports as absolute dotted/namespaced paths (Python "app.core.config",
    // Java/C#/Kotlin/Scala fully-qualified names, Rust/C++ "::" paths), which don't
    // start with "." or "/" and were being silently dropped here, leaving files that
    // import entirely via that style with zero resolved edges. Genuine third-party
    // packages (numpy, fastapi, std::...) are filtered out downstream instead — they
    // simply never match a real file path, so nothing extra needs filtering here.
    const localImports = rawImports;

    return {
        id: filePath,
        filePath,
        language,
        lineCount: lines.length,
        importCount: rawImports.length,
        exportCount: 0,
        complexity,
        nodeType: classifyNode(filePath),
        solarSystem: getSolarSystem(filePath),
        imports: localImports,
    };
}

// ── Import resolution ─────────────────────────────────────────────────────────
//
// Relative imports ("./foo") resolve against the importing file's directory.
// Everything else is either an npm package (ignore) or a tsconfig/jsconfig path
// alias ("@/foo" → "src/foo") — extremely common in modern TS repos (this very
// codebase uses "@/*" for basically every internal import). Without alias support,
// nearly all real edges in an aliased repo were silently dropped, leaving only the
// sparse handful of literal relative imports — a graph that looks arbitrary because
// most of the actual dependency structure was never represented.

interface AliasConfig {
    baseUrl: string;                 // posix, relative to repo root ('' = root)
    paths: Record<string, string[]>; // e.g. { "@/*": ["./src/*"] }
}

function stripJsonComments(text: string): string {
    // tsconfig.json is conventionally JSONC. Best-effort strip so JSON.parse doesn't
    // choke on comments/trailing commas — not a full JSONC parser; any remaining
    // parse failure just falls back to "no aliases" rather than failing analysis.
    return text
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:])\/\/.*$/gm, '$1')
        .replace(/,(\s*[}\]])/g, '$1');
}

function findConfigFile(files: Map<string, string>): string | undefined {
    return [...files.keys()]
        .filter((k) => /(^|\/)(tsconfig|jsconfig)\.json$/.test(k))
        .sort((a, b) => a.split('/').length - b.split('/').length)[0];
}

function parseAliasConfig(files: Map<string, string>): AliasConfig | null {
    const configPath = findConfigFile(files);
    if (!configPath) return null;
    try {
        const json = JSON.parse(stripJsonComments(files.get(configPath)!));
        const co = json.compilerOptions ?? {};
        const paths = co.paths as Record<string, string[]> | undefined;
        if (!paths || Object.keys(paths).length === 0) return null;

        const configDir = path.posix.dirname(configPath); // '.' for a root-level config
        const baseUrl = path.posix.normalize(
            path.posix.join(configDir === '.' ? '' : configDir, co.baseUrl ?? '.')
        );
        return { baseUrl: baseUrl === '.' ? '' : baseUrl, paths };
    } catch {
        return null;
    }
}

/** Resolves one non-relative import against tsconfig `paths`, e.g. "@/lib/foo" → "src/lib/foo". */
function resolveAlias(importStr: string, cfg: AliasConfig): string | null {
    for (const [pattern, targets] of Object.entries(cfg.paths)) {
        const target = targets[0];
        if (!target) continue;

        const starIdx = pattern.indexOf('*');
        if (starIdx === -1) {
            if (importStr !== pattern) continue;
            return path.posix.join(cfg.baseUrl, target);
        }

        const prefix = pattern.slice(0, starIdx);
        const suffix = pattern.slice(starIdx + 1);
        if (!importStr.startsWith(prefix) || !importStr.endsWith(suffix)) continue;
        if (importStr.length < prefix.length + suffix.length) continue;

        const wildcard = importStr.slice(prefix.length, importStr.length - suffix.length);
        return path.posix.join(cfg.baseUrl, target.replace('*', wildcard)).replace(/^\.\//, '');
    }
    return null;
}

function resolveImportPath(fromPath: string, importStr: string, aliasCfg: AliasConfig | null): string | null {
    if (importStr.startsWith('.') || importStr.startsWith('/')) {
        const dir = path.posix.dirname(fromPath);
        return path.posix.join(dir, importStr).replace(/^\//, '');
    }
    return aliasCfg ? resolveAlias(importStr, aliasCfg) : null;
}

/**
 * Converts a namespaced import string to a path-shaped candidate: Python
 * "app.core.config" → "app/core/config", Rust/C++ "std::collections::HashMap" →
 * "std/collections/HashMap". Left as-is if already path-shaped (Go "myrepo/pkg/foo")
 * or a bare specifier with no separator. This candidate is *package-root-relative*,
 * not repo-root-relative — the repo root usually sits a few directories above wherever
 * the package actually starts (e.g. "backend/app/core/config.py" for import
 * "app.core.config") — so it's matched by path suffix in the edge-building pass below,
 * not by exact match.
 */
function toNamespaceCandidate(importStr: string): string {
    if (importStr.includes('/')) return importStr;
    if (importStr.includes('::')) return importStr.replace(/::/g, '/');
    if (importStr.includes('.')) return importStr.replace(/\./g, '/');
    return importStr;
}

// ── Main export ───────────────────────────────────────────────────────────────

export function analyzeRepo(files: Map<string, string>): {
    nodes: ConstellationNodeData[];
    edgePairs: { from: string; to: string }[];
} {
    const aliasCfg = parseAliasConfig(files);
    const configFile = findConfigFile(files);

    const tsJsFiles = new Map<string, string>();
    const otherFiles = new Map<string, string>();

    for (const [fp, content] of files) {
        if (fp === configFile) continue; // tsconfig/jsconfig.json is metadata, not a source node
        (JS_TS_EXTS.has(path.extname(fp).toLowerCase()) ? tsJsFiles : otherFiles).set(fp, content);
    }

    const nodeMap = new Map<string, ConstellationNodeData>();

    // ── A. ts-morph analysis for TypeScript / JavaScript ─────────────────────
    if (tsJsFiles.size > 0) {
        const project = new Project({
            useInMemoryFileSystem: true,
            compilerOptions: { allowJs: true, jsx: 2, noEmit: true, skipLibCheck: true },
        });

        for (const [fp, content] of tsJsFiles) {
            const ext = path.extname(fp).toLowerCase();
            const sk = ext === '.tsx' || ext === '.jsx' ? ScriptKind.TSX : ScriptKind.TS;
            try { project.createSourceFile(fp, content, { overwrite: true, scriptKind: sk }); }
            catch { /* skip unparseable */ }
        }

        // Iterate our own tsJsFiles keys rather than project.getSourceFiles() + sf.getFilePath():
        // ts-morph's internal virtual FS standardizes/round-trips the path it hands back, which
        // can disagree with the exact string we fetched the file under (e.g. paths containing
        // spaces). Using our own key as the canonical filePath keeps it byte-identical to the
        // fileContentCache key the /api/explore/file route looks up later — otherwise the graph
        // node, sidebar, and click handler all carry a path that 404s against that cache.
        for (const filePath of tsJsFiles.keys()) {
            const sf = project.getSourceFile(filePath);
            if (!sf) continue; // failed to parse — skipped during createSourceFile above

            const ifCount = sf.getDescendantsOfKind(SyntaxKind.IfStatement).length;
            const ternCount = sf.getDescendantsOfKind(SyntaxKind.ConditionalExpression).length;
            const switchCount = sf.getDescendantsOfKind(SyntaxKind.SwitchStatement).length;
            const catchCount = sf.getDescendantsOfKind(SyntaxKind.CatchClause).length;
            const fnCount = sf.getFunctions().length +
                sf.getDescendantsOfKind(SyntaxKind.ArrowFunction).length;

            const importDecls = sf.getImportDeclarations();
            const resolvedImports = importDecls
                .map(d => resolveImportPath(filePath, d.getModuleSpecifierValue(), aliasCfg))
                .filter((r): r is string => r !== null);

            nodeMap.set(filePath, {
                id: filePath, filePath,
                language: getLanguage(filePath),
                lineCount: sf.getEndLineNumber(),
                importCount: importDecls.length,
                exportCount: sf.getExportDeclarations().length + (sf.getDefaultExportSymbol() ? 1 : 0),
                complexity: 1 + ifCount + ternCount + switchCount + catchCount + Math.ceil(fnCount * 0.5),
                luminosity: 0, gravity: 0,
                nodeType: classifyNode(filePath),
                solarSystem: getSolarSystem(filePath),
                imports: resolvedImports,
            });
        }
    }

    // ── B. Regex analysis for all other languages ─────────────────────────────
    for (const [fp, content] of otherFiles) {
        const language = getLanguage(fp);
        const analysis = analyzeFileRegex(fp, content, language);
        const resolvedImports = analysis.imports
            .map(i => (i.startsWith('.') || i.startsWith('/'))
                ? resolveImportPath(fp, i, aliasCfg)
                : toNamespaceCandidate(i))
            .filter((r): r is string => r !== null);

        nodeMap.set(fp, { ...analysis, imports: resolvedImports, luminosity: 0, gravity: 0 });
    }

    // ── C. Second pass: inbound gravity + edge pairs ──────────────────────────
    const inbound = new Map<string, number>();
    const edgePairs: { from: string; to: string }[] = [];

    // Exact match first (repo-root-relative candidates — JS/TS relative imports,
    // resolved aliases); falls back to matching by path *suffix* for package-root-
    // relative candidates (namespaced imports like Python's "app.core.config" →
    // "app/core/config", which is relative to wherever the package root sits, not
    // necessarily the repo root — e.g. it needs to match "backend/app/core/config.py").
    function findNodeMatch(candidates: string[]): string | undefined {
        for (const c of candidates) if (nodeMap.has(c)) return c;
        for (const c of candidates) {
            const suffix = '/' + c;
            for (const key of nodeMap.keys()) if (key.endsWith(suffix)) return key;
        }
        return undefined;
    }

    for (const [, node] of nodeMap) {
        for (const imp of node.imports) {
            const candidates = [
                imp,
                imp + '.ts', imp + '.tsx', imp + '.js', imp + '.jsx',
                imp + '.py', imp + '.go', imp + '.rs', imp + '.rb',
                imp.replace(/\.ts$/, '.tsx'), imp.replace(/\.tsx$/, '.ts'),
                imp + '/index.ts', imp + '/index.js', imp + '/__init__.py',
            ];
            const match = findNodeMatch(candidates);
            if (match) {
                inbound.set(match, (inbound.get(match) ?? 0) + 1);
                edgePairs.push({ from: node.filePath, to: match });
            }
        }
    }

    // ── D. Normalise luminosity ───────────────────────────────────────────────
    const maxC = Math.max(...[...nodeMap.values()].map(n => n.complexity), 1);
    for (const [, node] of nodeMap) {
        node.luminosity = node.complexity / maxC;
        node.gravity = inbound.get(node.filePath) ?? 0;
    }

    return { nodes: [...nodeMap.values()], edgePairs };
}
