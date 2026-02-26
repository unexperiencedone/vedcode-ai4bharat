import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { snippets, profiles, assets, portfolioWorks, logs, projects, projectMembers } from "@/db/schema";
import { desc, count, eq, sql } from "drizzle-orm";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;

    // Get current user's profile
    let userProfile = null;
    if (userEmail) {
      userProfile = await db.query.profiles.findFirst({
        where: eq(profiles.email, userEmail),
      });
    }

    // Recent projects for the archive dashboard
    const allProjects = await db.query.projects.findMany({
      with: {
        members: {
          with: {
            profile: true,
          }
        }
      },
      orderBy: [desc(projects.createdAt)],
    });

    // Formatting projects to include members simplified
    const formattedProjects = allProjects.map(p => ({
      ...p,
      members: p.members.map(m => ({
        id: m.profile.id,
        name: m.profile.name,
        handle: m.profile.handle,
        image: m.profile.image,
      }))
    }));

    // Stats
    const [snippetCount] = await db.select({ value: count() }).from(snippets);
    const [memberCount] = await db.select({ value: count() }).from(profiles);
    const [assetCount] = await db.select({ value: count() }).from(assets);
    const [worksCount] = await db.select({ value: count() }).from(portfolioWorks);

    // Dynamic metrics based on LIVE projects
    const totalActiveModules = allProjects.reduce((sum, p) => sum + (p.activeModules || 0), 0);
    const totalLiveDeployments = allProjects.reduce((sum, p) => sum + (p.liveDeployments || 0), 0);
    const totalPendingReview = allProjects.reduce((sum, p) => sum + (p.pendingReview || 0), 0);

    // Average system metrics
    const avgUptime = allProjects.length > 0
      ? (allProjects.reduce((sum, p) => sum + parseFloat(p.uptime || "0"), 0) / allProjects.length).toFixed(2) + "%"
      : "0.00%";
    const avgLatency = allProjects.length > 0
      ? Math.round(allProjects.reduce((sum, p) => sum + parseInt(p.latency || "0"), 0) / allProjects.length) + "ms"
      : "0ms";
    const avgLoad = allProjects.length > 0
      ? (allProjects.reduce((sum, p) => sum + parseFloat(p.load || "0"), 0) / allProjects.length).toFixed(2) + "%"
      : "0.00%";

    // Storage capacity (average of all projects)
    const avgStorageCapacity = allProjects.length > 0
      ? Math.round(allProjects.reduce((sum, p) => sum + (p.storageCapacity || 0), 0) / allProjects.length)
      : 0;

    // User's own snippet count
    let userSnippetCount = 0;
    if (userProfile) {
      const [usc] = await db
        .select({ value: count() })
        .from(snippets)
        .where(eq(snippets.authorId, userProfile.id));
      userSnippetCount = usc?.value ?? 0;
    }

    // User's snippet activity per month (last 12 months)
    let snippetActivity: number[] = new Array(12).fill(0);
    if (userProfile) {
      const userSnippets = await db
        .select({ createdAt: snippets.createdAt })
        .from(snippets)
        .where(eq(snippets.authorId, userProfile.id));

      const now = new Date();
      for (const s of userSnippets) {
        if (!s.createdAt) continue;
        const d = new Date(s.createdAt);
        const monthsAgo =
          (now.getFullYear() - d.getFullYear()) * 12 +
          (now.getMonth() - d.getMonth());
        if (monthsAgo >= 0 && monthsAgo < 12) {
          snippetActivity[11 - monthsAgo]++;
        }
      }
    }

    // Recent members (collaborators)
    const recentMembers = await db
      .select({
        id: profiles.id,
        name: profiles.name,
        handle: profiles.handle,
        image: profiles.image,
        role: profiles.role,
      })
      .from(profiles)
      .orderBy(desc(profiles.id))
      .limit(5);

    // User's portfolio works (ateliers)
    let userWorks: any[] = [];
    if (userProfile) {
      userWorks = await db
        .select({
          id: portfolioWorks.id,
          title: portfolioWorks.title,
          type: portfolioWorks.type,
          description: portfolioWorks.description,
          category: portfolioWorks.category,
          imageUrl: portfolioWorks.imageUrl,
          link: portfolioWorks.link,
          featured: portfolioWorks.featured,
          metadata: portfolioWorks.metadata,
          createdAt: portfolioWorks.createdAt,
        })
        .from(portfolioWorks)
        .where(eq(portfolioWorks.profileId, userProfile.id))
        .orderBy(desc(portfolioWorks.createdAt))
        .limit(4);
    }

    // Recent activity logs
    const recentLogs = await db
      .select({
        id: logs.id,
        action: logs.action,
        cluster: logs.cluster,
        author: logs.author,
        target: logs.target,
        message: logs.message,
        timestamp: logs.timestamp,
      })
      .from(logs)
      .orderBy(desc(logs.timestamp))
      .limit(20);

    return NextResponse.json({
      userProfile: userProfile
        ? {
          name: userProfile.name,
          handle: userProfile.handle,
          image: userProfile.image,
          role: userProfile.role,
          commitCount: userProfile.commitCount,
          prCount: userProfile.prCount,
          yearsActive: userProfile.yearsActive,
          location: userProfile.location,
        }
        : null,
      projects: formattedProjects,
      stats: {
        snippets: snippetCount?.value ?? 0,
        members: memberCount?.value ?? 0,
        assets: assetCount?.value ?? 0,
        works: worksCount?.value ?? 0,
        userSnippets: userSnippetCount,
        activeModules: totalActiveModules,
        liveDeployments: totalLiveDeployments,
        pendingReview: totalPendingReview,
        storageCapacity: avgStorageCapacity,
        uptime: avgUptime,
        latency: avgLatency,
        load: avgLoad,
        version: allProjects[0]?.version || "v.0.1.0",
      },
      recentMembers,
      userWorks,
      recentLogs,
      snippetActivity,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}
