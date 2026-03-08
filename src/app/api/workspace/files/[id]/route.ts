import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projectFiles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/auth';

const UpdateFileSchema = z.object({
  name: z.string().min(1).optional(),
  fileContent: z.string().optional(),
  filePath: z.string().optional() // useful if renaming a folder updates child paths in the future
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;
    const json = await req.json();
    const body = UpdateFileSchema.parse(json);
    const fileId = parseInt(id, 10);

    const [updatedFile] = await db.update(projectFiles)
      .set({
        ...body,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(projectFiles.id, fileId),
          eq(projectFiles.userId, session.user.id)
        )
      )
      .returning();

    return NextResponse.json(updatedFile);
  } catch (error: any) {
    console.error("[WORKSPACE_FILE_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;
    const fileId = parseInt(id, 10);

    // Note: If this is a folder, children will also need to be deleted.
    // Drizzle doesn't automatically cascade for self-referential without schema-level constraints on Postgres.
    // For MVP, we delete the item. Real implementations should do a recursive delete.
    
    await db.delete(projectFiles)
      .where(
        and(
          eq(projectFiles.id, fileId),
          eq(projectFiles.userId, session.user.id)
        )
      );

    return new NextResponse("Deleted", { status: 200 });
  } catch (error: any) {
    console.error("[WORKSPACE_FILE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
