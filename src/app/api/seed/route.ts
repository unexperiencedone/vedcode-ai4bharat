import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logs, profiles, snippets } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    // Check if logs exist
    const count = await db.select({ count: sql`count(*)` }).from(logs);
    if (Number(count[0].count) > 0) {
      // Check if profiles exist, if not seed them
      const profileCount = await db.select({ count: sql`count(*)` }).from(profiles);
      if (Number(profileCount[0].count) === 0) {
        // Proceed to seed profiles and snippets even if logs exist
      } else {
        return NextResponse.json({ message: "Database already seeded", count: count[0].count });
      }
    }

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

    if (Number(count[0].count) === 0) {
      await db.insert(logs).values(initialLogs);
    }

    // Seed Profiles
    const initialProfiles = [
      { 
        name: "Alex V.", 
        role: "Architect", 
        clerkId: "user_alex",
        handle: "alex",
        bio: "System Architect",
        hobbies: [],
        currentLearning: "Rust",
        socials: {}
      },
      { 
        name: "Sarah J.", 
        role: "Engineer", 
        clerkId: "user_sarah", 
        handle: "sarah",
        bio: "Senior Engineer",
        hobbies: [],
        currentLearning: "Go",
        socials: {}
      },
    ];

    const insertedProfiles = await db.insert(profiles).values(initialProfiles).returning();
    const alexId = insertedProfiles[0].id;
    const sarahId = insertedProfiles[1].id;

    // Seed Snippets
    const initialSnippets = [
      {
        title: "JWT Auth Middleware",
        code: "import jwt from 'jsonwebtoken';\n\nexport const auth = (req, res, next) => {\n  const token = req.header('x-auth-token');\n  if (!token) return res.status(401).send('Access denied.');\n\n  try {\n    const decoded = jwt.verify(token, process.env.JWT_SECRET);\n    req.user = decoded;\n    next();\n  } catch (ex) {\n    res.status(400).send('Invalid token.');\n  }\n};",
        language: "typescript",
        difficult: "Core",
        authorId: alexId
      },
      {
        title: "Recursive Binary Search",
        code: "fn binary_search(arr: &[i32], target: i32) -> Option<usize> {\n    if arr.is_empty() {\n        return None;\n    }\n\n    let mid = arr.len() / 2;\n    if arr[mid] == target {\n        return Some(mid);\n    } else if arr[mid] > target {\n        return binary_search(&arr[..mid], target);\n    } else {\n        return binary_search(&arr[mid + 1..], target).map(|i| mid + 1 + i);\n    }\n}",
        language: "rust",
        difficulty: "Expert",
        authorId: sarahId
      }
    ];

    await db.insert(snippets).values(initialSnippets);

    return NextResponse.json({ message: "Seeding complete", insertedLogs: initialLogs.length, insertedProfiles: initialProfiles.length });
  } catch (error) {
    console.error("Seeding failed:", error);
    return NextResponse.json({ error: "Seeding failed", details: String(error) }, { status: 500 });
  }
}
