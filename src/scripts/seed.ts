import "dotenv/config";
import { db } from "../lib/db";
import { logs, profiles } from "../db/schema";
import { exit } from "process";

async function main() {
  console.log("Seeding profiles...");
  await db.insert(profiles).values([
    {
      clerkId: "user_2sN...",
      name: "Kalyan",
      handle: "kalyan",
      role: "Architect",
      bio: "Building systems that think.",
      currentLearning: "Agentic AI Patterns",
      hobbies: ["Photography", "Piano"],
      socials: { twitter: "@kalyan", github: "kalyan" }
    },
    {
      clerkId: "user_3rM...",
      name: "Riya",
      handle: "riya",
      role: "Designer",
      bio: "Crafting digital dreams.",
      currentLearning: "Spline 3D",
      hobbies: ["Generative Art", "Hiking"],
      socials: { twitter: "@riya_design" }
    }
  ]).onConflictDoNothing();

  console.log("Seeding logs...");
  const initialLogs = [
    {
      action: "DEPLOY",
      cluster: 1,
      author: "Alex V.",
      target: "v4.0.3-beta",
      message: "Deployed hotfix for ledger sync based on user feedback.",
    },
    {
      action: "COMMIT",
      cluster: 2,
      author: "Sarah J.",
      target: "vault-core",
      message: "Optimized search query performance by 40%.",
    },
    {
      action: "ALERT",
      cluster: 5,
      author: "System",
      target: "Node_01",
      message: "High memory usage detected. Auto-scaling triggered.",
    },
     {
      action: "SYNC",
      cluster: 1,
      author: "Ledger Bot",
      target: "Global State",
      message: "Synced 142 transactions from Cluster 2.",
    },
    {
      action: "MEMBER_JOIN",
      cluster: 3,
      author: "Guild Hall",
      target: "New User",
      message: "Welcome to The Archive, @neo_dev.",
    }
  ];

for (const log of initialLogs) {
  await db.insert(logs).values(log);
}

console.log("Seeding complete!");
exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  exit(1);
});
