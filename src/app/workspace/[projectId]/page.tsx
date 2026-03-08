import { WorkspaceEditor } from '@/components/project/WorkspaceEditor';

export default async function WorkspaceProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;
    
    return (
        <div className="w-full h-full">
            <WorkspaceEditor projectId={projectId} />
        </div>
    );
}
