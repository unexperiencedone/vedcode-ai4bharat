import { Project, Node } from "ts-morph";
import * as path from "path";

export interface ImpactNode {
    filePath: string;
    name: string;
    type: string;
    dependencies: string[];
}

export class CodebaseAnalyzer {
    private project: Project;

    constructor(projectPath: string) {
        this.project = new Project({
            tsConfigFilePath: path.join(projectPath, "tsconfig.json"),
            skipAddingFilesFromTsConfig: true,
        });
        // Add all source files in the project
        this.project.addSourceFilesAtPaths([
            path.join(projectPath, "src/**/*.{ts,tsx}"),
        ]);
    }

    /**
     * Find which files import or use a specific exported symbol.
     */
    public findRippleEffects(filePath: string, symbolName: string): string[] {
        const sourceFile = this.project.getSourceFile(filePath);
        if (!sourceFile) return [];

        const exportedSymbol = sourceFile.getExportSymbols().find(s => s.getName() === symbolName);
        if (!exportedSymbol) return [];

        const affectedFiles = new Set<string>();

        const declarations = exportedSymbol.getDeclarations();
        if (declarations.length === 0) return [];

        const firstDecl = declarations[0];

        // Check if it's a node that can be referenced
        if (Node.isReferenceFindable(firstDecl)) {
            const referencedSymbols = firstDecl.findReferences();
            for (const referencedSymbol of referencedSymbols) {
                for (const reference of referencedSymbol.getReferences()) {
                    const refSourceFile = reference.getSourceFile();
                    if (refSourceFile.getFilePath() !== sourceFile.getFilePath()) {
                        affectedFiles.add(refSourceFile.getFilePath());
                    }
                }
            }
        }

        return Array.from(affectedFiles);
    }

    /**
     * Get a map of all exported symbols and their locations.
     */
    public getExportMap() {
        const exportMap: Record<string, string[]> = {};

        this.project.getSourceFiles().forEach(sourceFile => {
            const exports = sourceFile.getExportSymbols().map(s => s.getName());
            if (exports.length > 0) {
                exportMap[sourceFile.getFilePath()] = exports;
            }
        });

        return exportMap;
    }
}
