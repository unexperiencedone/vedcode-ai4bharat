import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projects, projectMembers, profiles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/auth';
import { z } from 'zod';

const CreateProjectSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    // Find all projects where the user is a member
    const userProjects = await db
      .select({
        project: projects
      })
      .from(projectMembers)
      .innerJoin(projects, eq(projectMembers.projectId, projects.id))
      .where(eq(projectMembers.profileId, session.user.id));

    return NextResponse.json(userProjects.map(p => p.project));
  } catch (error: any) {
    console.error("[CODEBASES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const json = await req.json();
    const body = CreateProjectSchema.parse(json);

    // Generate a quick fake archive ID
    const archiveId = `ARCHIVE-${Math.floor(Math.random() * 900) + 100}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;

    const [newProject] = await db.insert(projects).values({
      title: body.title,
      description: body.description || "",
      archiveId,
    }).returning();

    // Link the creator as a member
    await db.insert(projectMembers).values({
      projectId: newProject.id,
      profileId: session.user.id,
    });

    return NextResponse.json(newProject);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid data", { status: 422 });
    }
    console.error("[CODEBASES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
