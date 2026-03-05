import "dotenv/config";
import { CodeGraphBuilder } from "../lib/codebase/codeGraphBuilder";
import * as path from "path";

async function main() {
    const rootPath = path.join(process.cwd());
    console.log(`🏠 Resolving project at: ${rootPath}`);

    const builder = new CodeGraphBuilder(rootPath);

    try {
        await builder.indexCodebase();
        console.log("🌟 Indexing finished successfully!");
    } catch (error) {
        console.error("❌ Indexing failed:", error);
    }
}

main();
