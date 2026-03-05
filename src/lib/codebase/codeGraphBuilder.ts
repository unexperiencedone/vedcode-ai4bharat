import { db } from "../db";
import { fileNodes, symbolNodes, fileEdges, symbolEdges, conceptUsage, codeChangeLog, architectureMetrics } from "../../db/schema";
import { Project, SyntaxKind, Node, SourceFile } from "ts-morph";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { ConceptTraceEngine } from "../code-intelligence/conceptTraceEngine";
import { ArchitecturalStressEngine } from "../code-intelligence/stressEngine";
import { eq, and, sql } from "drizzle-orm";

export class CodeGraphBuilder {
    private project: Project;
    private traceEngine: ConceptTraceEngine;
    private stressEngine: ArchitecturalStressEngine;
    private rootPath: string;

    constructor(rootPath: string) {
        this.rootPath = rootPath;
        this.project = new Project({
            compilerOptions: {
                target: 99, // ESNext
                module: 99, // ESNext
            }
        });
        this.traceEngine = new ConceptTraceEngine();
        this.stressEngine = new ArchitecturalStressEngine();
    }

    /**
     * Orchestrate the full indexing pipeline.
     */
    async indexCodebase() {
        console.log("🚀 Starting incremental codebase indexing...");
        await this.traceEngine.initialize();

        // Stage 1: File Discovery
        const files = await this.discoverFiles(this.rootPath);
        console.log(`📂 Discovered ${files.length} relevant files.`);

        // Stage 2 & 3: AST Extraction & Graph Construction
        for (const file of files) {
            // Check if file has changed
            const existing = await db.query.fileNodes.findFirst({
                where: eq(fileNodes.path, file.relPath),
            });

            if (existing && existing.hash === file.hash) {
                // Skip re-parsing if hash hasn't changed
                continue;
            }

            // Update change log (Feature 5.2.5)
            if (existing) { // Only log changes for existing files
                await db.insert(codeChangeLog).values({
                    fileId: existing.id,
                    changeCount: 1,
                    lastModified: new Date()
                }).onConflictDoUpdate({
                    target: [codeChangeLog.fileId],
                    set: {
                        changeCount: sql`${codeChangeLog.changeCount} + 1`,
                        lastModified: new Date()
                    }
                });
            }

            await this.processFile(file.absPath, file.relPath, file.hash);
        }

        // Stage 4: Architectural Stress Analysis (Feature 5.2.5)
        await this.stressEngine.runFullScan();

        console.log("🏁 Global Indexing Complete.");
    }

    private async discoverFiles(dir: string, allFiles: { absPath: string; relPath: string; hash: string }[] = []) {
        const skipDirs = ["node_modules", ".git", ".next", "dist", "build", "drizzle"];
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relPath = path.relative(this.rootPath, fullPath).replace(/\\/g, "/");

            if (entry.isDirectory()) {
                if (skipDirs.includes(entry.name)) continue;
                await this.discoverFiles(fullPath, allFiles);
            } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
                const content = fs.readFileSync(fullPath, "utf8");
                const hash = crypto.createHash("md5").update(content).digest("hex");
                allFiles.push({ absPath: fullPath, relPath, hash });
            }
        }
        return allFiles;
    }

    private async processFile(absPath: string, relPath: string, currentHash: string) {
        // Check if file has changed
        const existing = await db.query.fileNodes.findFirst({
            where: eq(fileNodes.path, relPath),
        });

        console.log(`📄 Indexing ${relPath}...`);
        const sourceFile = this.project.addSourceFileAtPath(absPath);

        // UPSERT File Node
        let fileId: string;
        if (existing) {
            fileId = existing.id;
            await db.update(fileNodes)
                .set({ hash: currentHash, lastIndexed: new Date() })
                .where(eq(fileNodes.id, fileId));

            // Clear old symbols/usages for this file to rebuild
            await db.delete(symbolNodes).where(eq(symbolNodes.fileId, fileId));
            await db.delete(conceptUsage).where(eq(conceptUsage.fileId, fileId));
        } else {
            const inserted = await db.insert(fileNodes).values({
                path: relPath,
                language: path.extname(relPath).slice(1),
                hash: currentHash,
                size: fs.statSync(absPath).size,
            }).returning({ id: fileNodes.id });
            fileId = inserted[0].id;
        }

        // Stage 2: Symbol Extraction
        await this.extractSymbols(sourceFile, fileId);

        // Stage 2.1: Dependency Extraction (Imports & Calls)
        await this.extractDependencies(sourceFile, fileId);

        // Stage 3: Concept Tracing
        const conceptsFound = await this.traceEngine.traceFile(sourceFile, fileId);
        if (conceptsFound > 0) {
            console.log(`  ✨ Found ${conceptsFound} concept usages in ${relPath}`);
        }

        // Clean up ts-morph memory
        this.project.removeSourceFile(sourceFile);
    }

    private async extractDependencies(sourceFile: SourceFile, fileId: string) {
        // 1. File Edges (Imports)
        const imports = sourceFile.getImportDeclarations();
        for (const imp of imports) {
            const moduleSpecifier = imp.getModuleSpecifierValue();
            // Only track local imports for now
            if (moduleSpecifier.startsWith(".")) {
                const resolvedPath = path.join(path.dirname(sourceFile.getFilePath()), moduleSpecifier);
                const targetRelPath = path.relative(this.rootPath, resolvedPath).replace(/\\/g, "/");

                // Find target file ID (may not be indexed yet, so we use a loose match or skip)
                const target = await db.query.fileNodes.findFirst({
                    where: eq(fileNodes.path, targetRelPath)
                });

                if (target) {
                    await db.insert(fileEdges).values({
                        sourceFileId: fileId,
                        targetFileId: target.id,
                        type: "import"
                    }).onConflictDoNothing();
                }
            }
        }

        // 2. Symbol Edges (Calls/References) - Simplified for MVP
        sourceFile.forEachDescendant(node => {
            if (Node.isCallExpression(node)) {
                const name = node.getExpression().getText();
                // Here we'd ideally resolve the symbol to its ID in the DB.
            }
        });
    }

    private async extractSymbols(sourceFile: SourceFile, fileId: string) {
        // Functions
        const functions = sourceFile.getFunctions();
        for (const fn of functions) {
            const name = fn.getName() || "anonymous";
            await db.insert(symbolNodes).values({
                fileId,
                name,
                type: /^[A-Z]/.test(name) ? "component" : "function",
                startLine: fn.getStartLineNumber(),
                endLine: fn.getEndLineNumber(),
                signature: fn.getSignature().getDeclaration().getText().slice(0, 200),
            });
        }

        // Classes
        const classes = sourceFile.getClasses();
        for (const cls of classes) {
            const name = cls.getName() || "anonymous";
            await db.insert(symbolNodes).values({
                fileId,
                name,
                type: "class",
                startLine: cls.getStartLineNumber(),
                endLine: cls.getEndLineNumber(),
                signature: name,
            });
        }

        // Variables (exported constants/components)
        const vars = sourceFile.getVariableDeclarations();
        for (const v of vars) {
            if (v.isExported()) {
                const name = v.getName();
                await db.insert(symbolNodes).values({
                    fileId,
                    name,
                    type: /^[A-Z]/.test(name) ? "component" : "variable",
                    startLine: v.getStartLineNumber(),
                    endLine: v.getEndLineNumber(),
                });
            }
        }
    }
}
