"use server";
import { db } from '@/lib/db';
import { projectFiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getProjectFiles(userId: string) {
    return await db.query.projectFiles.findMany({
        where: eq(projectFiles.userId, userId)
    });
}
