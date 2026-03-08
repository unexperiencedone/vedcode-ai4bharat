import { BookOpen } from "lucide-react";
import { getHandbookSections } from "@/lib/actions/handbookActions";

export default async function HandbookIndexPage({
    params
}: {
    params: Promise<{ tech: string }>
}) {
    const { tech } = await params;
    const sections = await getHandbookSections(tech);

    // Calculate total concepts
    const totalConcepts = sections.reduce((acc, curr) => acc + curr.concepts.length, 0);

    return (
        <div className="flex flex-col items-center justify-center h-full p-12 text-center">
            <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="w-10 h-10 text-indigo-400" />
            </div>
            <h1 className="text-4xl font-extrabold text-white mb-4 capitalize">
                {tech} Handbook
            </h1>
            <p className="text-lg text-neutral-400 max-w-xl mx-auto mb-8">
                Welcome to the unified documentation interface. Select a topic from the sidebar to begin exploring.
            </p>
            <div className="flex gap-4 items-center justify-center">
                <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 flex flex-col items-center">
                    <span className="text-2xl font-bold text-white mb-1">{sections.length}</span>
                    <span className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Chapters</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 flex flex-col items-center">
                    <span className="text-2xl font-bold text-indigo-400 mb-1">{totalConcepts}</span>
                    <span className="text-xs uppercase tracking-widest text-neutral-500 font-bold">Concepts</span>
                </div>
            </div>
        </div>
    );
}
