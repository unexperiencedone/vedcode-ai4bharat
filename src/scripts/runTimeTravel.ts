import "dotenv/config";
import { db } from "../lib/db";
import { profiles, fileNodes } from "../db/schema";
import { ConceptDiffEngine, FileSnapshot } from "../lib/code-intelligence/conceptDiffEngine";
import { RegressionCorrelationEngine, FailureContext } from "../lib/code-intelligence/regressionDetector";

async function simulateTimeTravelLoop() {
    console.log("⏳ Starting Concept Time-Travel Simulation...\n");

    // 1. Get a test user and file
    const allProfiles = await db.select().from(profiles).limit(1);
    if (allProfiles.length === 0) {
        console.error("No profiles found to run the test.");
        process.exit(1);
    }
    const profileId = allProfiles[0].id;
    const fileId = crypto.randomUUID();

    const diffEngine = new ConceptDiffEngine();
    await diffEngine.initialize();
    
    const regressionEngine = new RegressionCorrelationEngine();

    console.log(`👨‍💻 Developer Profile ID: ${profileId}`);

    // --- COMMIT 1 (Initial Setup) ---
    console.log("\n[Commit a91f3c] Developer introduces basic fetching (No Async/Await)");
    const codeV1 = `
    function fetchData() {
        return fetch('/api/data').then(res => res.json());
    }
    `;
    const snapshotV1: FileSnapshot = {
        profileId,
        commitHash: "a91f3c",
        fileId,
        beforeCode: "",
        afterCode: codeV1
    };
    await diffEngine.processDiff(snapshotV1);
    console.log("   ✅ Synced: Promise chaining concept recorded.");

    // --- COMMIT 2 (Refactoring to Async/Await) ---
    console.log("\n[Commit f72aa9] Developer refactors to Async/Await, but forgets try/catch");
    const codeV2 = `
    async function fetchData() {
        const res = await fetch('/api/data');
        return await res.json();
    }
    `;
    const snapshotV2: FileSnapshot = {
        profileId,
        commitHash: "f72aa9",
        fileId,
        beforeCode: codeV1,
        afterCode: codeV2
    };
    const diffLog = await diffEngine.processDiff(snapshotV2);
    
    console.log("   🔍 Concept Diff Detected:");
    diffLog.forEach(log => {
        console.log(`      - \${log.changeType.toUpperCase()}: \${log.conceptId} (Confidence: \${log.confidence * 100}%)`);
    });

    // --- REGRESSION INCIDENT ---
    console.log("\n🔥 ALERT: Test Suite Failed in CI/CD pipeline!");
    console.log("Trace: Unhandled Promise Rejection in fetchData()");

    console.log("\n🧠 Regression Correlation Engine Analyzing Failure...");
    const failureCtx: FailureContext = {
        profileId,
        commitHash: "f72aa9",
        errorMessage: "Unhandled Promise Rejection",
        failedFileId: fileId
    };

    const insights = await regressionEngine.analyzeFailure(failureCtx);
    
    if (insights.length > 0) {
        const topInsight = insights[0];
        console.log(`\n💡 HUMAN KNOWLEDGE GAP DETECTED:`);
        console.log(`   [Risk Score: \${topInsight.riskScore.toFixed(2)}]`);
        console.log(`   ${topInsight.insightMessage}`);
    } else {
        console.log("No severe knowledge gaps found corresponding to this failure.");
    }

    console.log("\n✅ Time-Travel Debugging Simulation Complete.");
    process.exit(0);
}

simulateTimeTravelLoop();
