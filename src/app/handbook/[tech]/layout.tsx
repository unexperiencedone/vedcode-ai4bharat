import { getHandbookSections } from "@/lib/actions/handbookActions";
import { HandbookSidebar } from "@/components/docs/HandbookSidebar";

export default async function HandbookLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ tech: string }>;
}) {
    const { tech } = await params;
    
    // Fetch sections for the sidebar
    const sections = await getHandbookSections(tech);
    
    // We don't have activeConceptSlug at the layout level easily without client component or matched segment,
    // so we pass undefined here. The Sidebar can use useParams to figure it out, but our Sidebar component
    // accepts it as a prop. Let's rely on the Sidebar's internal active state if possible, or pass nothing for now.

    return (
        <div className="flex flex-1 min-h-0 h-full w-full bg-background text-white overflow-hidden">
            <HandbookSidebar techSlug={tech} sections={sections} />
            <div className="flex-1 min-h-0 overflow-y-auto">
                {children}
            </div>
        </div>
    );
}
