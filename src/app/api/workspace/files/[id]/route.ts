import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projectFiles } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
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

    // Recursively collect this node and every descendant (folders can nest
    // arbitrarily deep) before deleting, so removing a folder actually removes
    // its contents instead of orphaning them with a parentId pointing at a
    // now-deleted row.
    const allNodes = await db.query.projectFiles.findMany({
      where: eq(projectFiles.userId, session.user.id),
      columns: { id: true, parentId: true },
    });

    const childrenByParent = new Map<number, number[]>();
    for (const node of allNodes) {
      if (node.parentId === null) continue;
      const siblings = childrenByParent.get(node.parentId) ?? [];
      siblings.push(node.id);
      childrenByParent.set(node.parentId, siblings);
    }

    const idsToDelete: number[] = [];
    const queue = [fileId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      idsToDelete.push(current);
      queue.push(...(childrenByParent.get(current) ?? []));
    }

    await db.delete(projectFiles)
      .where(
        and(
          inArray(projectFiles.id, idsToDelete),
          eq(projectFiles.userId, session.user.id)
        )
      );

    return NextResponse.json({ deletedIds: idsToDelete });
  } catch (error: any) {
    console.error("[WORKSPACE_FILE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
