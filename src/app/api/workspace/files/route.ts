import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projectFiles } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/auth';

const CreateFileSchema = z.object({
  name: z.string().min(1),
  isFolder: z.boolean().default(false),
  parentId: z.number().nullable().optional(),
  filePath: z.string().min(1),
  projectId: z.string().uuid()
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) return new NextResponse("Project ID required", { status: 400 });

    const files = await db.query.projectFiles.findMany({
      where: and(
          eq(projectFiles.userId, session.user.id),
          eq(projectFiles.projectId, projectId)
      ),
      orderBy: (files, { asc }) => [asc(files.isFolder), asc(files.name)], 
      limit: 1000
    });

    return NextResponse.json(files);
  } catch (error: any) {
    console.error("[WORKSPACE_FILES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const json = await req.json();
    const body = CreateFileSchema.parse(json);

    let computedPath = body.filePath;

    if (body.parentId) {
      // Find parent to prefix path correctly
      const parent = await db.query.projectFiles.findFirst({
        where: eq(projectFiles.id, body.parentId),
      });
      if (parent) {
        computedPath = `${parent.filePath}/${body.name}`.replace(/\/\//g, '/');
      }
    }

    const [newFile] = await db.insert(projectFiles).values({
      userId: session.user.id,
      projectId: body.projectId,
      name: body.name,
      isFolder: body.isFolder,
      parentId: body.parentId ?? null,
      filePath: computedPath,
      fileContent: body.isFolder ? "" : ""
    }).returning();

    return NextResponse.json(newFile);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid data", { status: 422 });
    }
    console.error("[WORKSPACE_FILES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
