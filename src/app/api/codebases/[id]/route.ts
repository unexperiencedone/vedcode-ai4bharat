import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { projects, projectMembers, projectFiles } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/auth';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { id: projectId } = await params;
    if (!projectId) return new NextResponse("Project ID required", { status: 400 });

    // Verify user is a member 
    const isMember = await db.query.projectMembers.findFirst({
        where: and(
            eq(projectMembers.projectId, projectId),
            eq(projectMembers.profileId, session.user.id)
        )
    });

    if (!isMember) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    // Since onDelete cascade is not perfectly defined on all relations, manual cleanup
    await db.delete(projectFiles).where(eq(projectFiles.projectId, projectId));
    await db.delete(projectMembers).where(eq(projectMembers.projectId, projectId));
    await db.delete(projects).where(eq(projects.id, projectId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[CODEBASES_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
