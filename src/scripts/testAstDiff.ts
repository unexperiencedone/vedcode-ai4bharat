import { ASTDiff } from "../lib/contextGuard/astDiff";

async function test() {
    const diffEngine = new ASTDiff();

    const oldCode = `
    export function fetchUser() { return "user"; }
    export const profile = { name: "test" };
  `;

    const newCode = `
    export function fetchUser() { return "user_updated"; }
    export const profile = { name: "test", age: 25 };
    export function newHelper() { return true; }
  `;

    console.log("🧪 Testing AST Diff...");
    const changes = await diffEngine.diff(oldCode, newCode, "test.ts");

    console.log("📊 Detected Changes:");
    console.log(JSON.stringify(changes, null, 2));

    const hasModifiedFetch = changes.some(c => c.name === "fetchUser" && c.changeType === "modified");
    const hasAddedHelper = changes.some(c => c.name === "newHelper" && c.changeType === "added");

    if (hasModifiedFetch && hasAddedHelper) {
        console.log("🎉 AST Diff Test Passed!");
    } else {
        console.log("❌ AST Diff Test Failed.");
    }
}

test();
