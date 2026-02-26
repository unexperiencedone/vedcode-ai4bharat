import "dotenv/config";
import { db } from "../lib/db";
import { logs, profiles, projects, projectMembers } from "../db/schema";
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

  console.log("Seeding projects...");
  const [kalyan, riya] = await db.select().from(profiles).orderBy(profiles.id).limit(2);

  const seedProjects = [
    {
      archiveId: "ARCHIVE-772-X",
      title: "Quantum Neural Gateway",
      description: "Enterprise-grade API gateway for distributed inference clusters across multi-cloud environments.",
      status: "LIVE",
      category: "Infrastructure",
      tags: ["REACT", "PYTHON", "TERRAFORM"],
      activeModules: 142,
      liveDeployments: 48,
      pendingReview: 12,
      storageCapacity: 76,
      uptime: "99.98", // Numeric for easier aggregation
      latency: "14",
      load: "0.12",
      version: "v4.22.0-STABLE",
    },
    {
      archiveId: "ARCHIVE-881-A",
      title: "Cobalt Core Mesh",
      description: "Redesigning the decentralized communication mesh for low-latency node-to-node data transfers.",
      status: "IN_DESIGN",
      category: "Infrastructure",
      tags: ["RUST", "WASM"],
      activeModules: 64,
      liveDeployments: 12,
      pendingReview: 5,
      storageCapacity: 45,
      uptime: "99.95",
      latency: "8",
      load: "0.08",
      version: "v0.8.4-BETA",
    },
    {
      archiveId: "ARCHIVE-012-Y",
      title: "Obsidian UI Kit",
      description: "Internal design system library built on top of Headless UI and Tailwind CSS for rapid prototyping.",
      status: "PAUSED",
      category: "Web Applications",
      tags: ["FIGMA", "TAILWIND"],
      activeModules: 32,
      liveDeployments: 0,
      pendingReview: 8,
      storageCapacity: 20,
      uptime: "0.00",
      latency: "0",
      load: "0.00",
      version: "v1.0.2",
    }

  ];

  for (const p of seedProjects) {
    const [insertedProject] = await db.insert(projects).values(p)
      .onConflictDoUpdate({
        target: projects.archiveId,
        set: p,
      })
      .returning();
    
    // Link members
    if (kalyan) {
      await db.insert(projectMembers).values({
        projectId: insertedProject.id,
        profileId: kalyan.id,
      });
    }
    if (riya && p.archiveId !== "ARCHIVE-012-Y") {
      await db.insert(projectMembers).values({
        projectId: insertedProject.id,
        profileId: riya.id,
      });
    }
  }

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
