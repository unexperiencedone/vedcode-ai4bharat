import "dotenv/config";
import { GroundingEngine } from "../lib/code-intelligence/groundingEngine";

async function verifyGrounding() {
    console.log("🕵️ Verifying Knowledge Studio Grounding...");

    const engine = new GroundingEngine();
    
    // 1. Test Keyword: "useEffect" (Should be in our project)
    const keyword = "useEffect";
    console.log(`\n🔍 Querying context for: "${keyword}"`);
    
    const context = await engine.getContext(keyword);
    
    if (!context.concept) {
        console.log("❌ Concept not found in Knowledge Base. Running indexer/bootstrap might be needed.");
        process.exit(1);
    }

    console.log("✅ Concept Found:", context.concept.name);
    console.log("✅ Usages in project:", context.usages.length);

    // 2. Format Context
    const formatted = engine.formatContextToPrompt(context);
    console.log("\n📦 Formatted Grounding Context:");
    console.log("-----------------------------------");
    console.log(formatted);
    console.log("-----------------------------------");

    console.log("\n✨ Grounding Verification Complete.");
    process.exit(0);
}

verifyGrounding().catch(err => {
    console.error("❌ Verification failed:", err);
    process.exit(1);
});
