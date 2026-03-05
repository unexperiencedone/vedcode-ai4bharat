import "dotenv/config";
import { CodeGraphBuilder } from "../lib/codebase/codeGraphBuilder";
import { db } from "../lib/db";
import { architectureMetrics, fileNodes } from "../db/schema";
import { desc } from "drizzle-orm";

async function verifyStress() {
    console.log("🕵️ Verifying Architectural Stress Analysis...");

    const builder = new CodeGraphBuilder(process.cwd());

    // 1. Run full indexing (this will trigger stress scan)
    await builder.indexCodebase();

    // 2. Query the metrics
    const topHotspots = await db.select()
        .from(architectureMetrics)
        .orderBy(desc(architectureMetrics.stressScore))
        .limit(5);

    console.log("\n🔥 Top Architectural Hotspots:");
    for (const spot of topHotspots) {
        // Find name
        const file = await db.query.fileNodes.findFirst({
            where: (fields, { eq }) => eq(fields.id, spot.nodeId)
        });

        console.log(`- ${file?.path || spot.nodeId} [${spot.nodeType}]`);
        console.log(`  Stress Score: ${(spot.stressScore ?? 0).toFixed(2)}`);
        console.log(`  Coupling: ${(spot.couplingScore ?? 0).toFixed(2)} | Density: ${(spot.conceptDensity ?? 0).toFixed(2)} | Frequency: ${(spot.changeFrequency ?? 0).toFixed(2)}`);
    }

    process.exit(0);
}

verifyStress().catch(err => {
    console.error("❌ Verification failed:", err);
    process.exit(1);
});
