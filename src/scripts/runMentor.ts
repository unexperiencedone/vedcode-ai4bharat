import "dotenv/config";
import { db } from "../lib/db";
import { profiles } from "../db/schema";
import { aggregatePatterns, RawSignalContext } from "../lib/code-intelligence/patternAggregator";
import { generateMentorInsights } from "../lib/code-intelligence/mentorInsightEngine";
import { getActivePatterns } from "../lib/code-intelligence/evidenceMemory";

async function simulateMentorLoop() {
    console.log("🕵️ Starting Mentor Engine Simulation...");

    // 1. Get a test user
    const allProfiles = await db.select().from(profiles).limit(1);
    if (allProfiles.length === 0) {
        console.error("No profiles found to run the test.");
        process.exit(1);
    }
    const profileId = allProfiles[0].id;
    const dummyFileId1 = crypto.randomUUID();
    const dummyFileId2 = crypto.randomUUID();

    console.log(`\n👨‍💻 Developer Profile ID: ${profileId}`);

    // --- DAY 1: Developer makes an async mistake ---
    console.log("\n[Day 1] Simulating Code Change: Async without Try/Catch (File A)");
    const day1Context: RawSignalContext = {
        profileId,
        fileId: dummyFileId1,
        detectedConcepts: [
            { slug: 'async_await', confidence: 0.9 }
            // Missing error handling
        ],
        architecturalStress: 0.2
    };
    await aggregatePatterns(day1Context);

    // Run Mentor Engine => Occurrence count is 1, so severity is low. Likely no insight.
    console.log("\n🧠 Mentor Engine Evaluating Day 1...");
    let insights = await generateMentorInsights(profileId, dummyFileId1);
    if (insights.length === 0) {
        console.log("🤫 Mentor remains silent (Severity too low to interrupt flow - Alert Fatigue Prevented).");
    } else {
        console.log("💬 Insight:", insights[0]);
    }

    // --- DAY 3: Developer makes the exact same mistake ---
    console.log("\n[Day 3] Simulating Code Change: Async without Try/Catch (File B)");
    const day3Context: RawSignalContext = {
        profileId,
        fileId: dummyFileId2,
        detectedConcepts: [
            { slug: 'async_await', confidence: 0.95 }
        ],
        architecturalStress: 0.3
    };
    // Let's pump it twice to simulate history building
    await aggregatePatterns(day3Context);
    await aggregatePatterns(day3Context);

    console.log("🔍 Checking Evidence Memory...");
    const patterns = await getActivePatterns(profileId);
    console.log(patterns.map(p => `- Pattern: ${p.patternType} | Occurrences: ${p.occurrenceCount} | Confidence: ${p.confidenceScore}`));

    // Run Mentor Engine => Occurrence count is now 3. Severity should spike above 0.5.
    console.log("\n🧠 Mentor Engine Evaluating Day 3...");
    insights = await generateMentorInsights(profileId, dummyFileId2);
    if (insights.length > 0) {
        console.log("💡 MENTOR INSIGHT GENERATED:");
        console.log(`[${insights[0].title.toUpperCase()}] Severity: ${(insights[0].severityScore * 100).toFixed(0)}%`);
        console.log(`> ${insights[0].actionableAdvice}`);
    }

    // --- IMMEDIATELY AFTER: Developer saves file again (Checking Cooldowns) ---
    console.log("\n[Day 3 + 5 mins] Simulating Rapid File Save...");
    console.log("🧠 Mentor Engine Evaluating...");
    insights = await generateMentorInsights(profileId, dummyFileId2);
    if (insights.length === 0) {
         console.log("🤫 Mentor remains silent (Insight is on 24-hour cooldown - Alert Fatigue Prevented).");
    } else {
         console.log("💬 Insight:", insights[0]);
    }

    console.log("\n✅ Evaluation Complete.");
    process.exit(0);
}

simulateMentorLoop();

