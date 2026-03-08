"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles, Activity, BrainCircuit, Columns, Target } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { MasteryMeter } from '../intelligence/MasteryMeter';
import { ConceptTimelineWidget, ConceptChange } from '../ui/ConceptTimelineWidget';
import { ArchitecturalHeatmap } from './ArchitecturalHeatmap';
import { getArchitecturalHeatmap, getRecentConceptChanges, getUserCognitiveState } from '@/lib/actions/dashboardActions';

export function CheckupView() {
    const { data: session } = useSession();
    const [heatmapData, setHeatmapData] = useState<any[]>([]);
    const [conceptChanges, setConceptChanges] = useState<ConceptChange[]>([]);
    const [cognitiveState, setCognitiveState] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadDashboard() {
            if (session?.user) {
                const user = session.user as any;
                try {
                    const [hData, cChanges, cState] = await Promise.all([
                        getArchitecturalHeatmap(),
                        getRecentConceptChanges(user.id),
                        getUserCognitiveState(user.id)
                    ]);
                    setHeatmapData(hData || []);
                    setConceptChanges(cChanges || []);
                    setCognitiveState(cState);
                } catch (error) {
                    console.error("Failed to load dashboard data:", error);
                }
            }
            setLoading(false);
        }
        loadDashboard();
    }, [session]);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background text-slate-400">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold uppercase tracking-widest">Analysing System...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background text-foreground overflow-y-auto">
            {/* Header */}
            <header className="px-8 py-6 border-b border-white/5 bg-slate-900/50 sticky top-0 z-10 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl">
                        <BrainCircuit size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">System Checkup</h1>
                        <p className="text-sm text-slate-400">The intersection of code architecture and your cognitive growth.</p>
                    </div>
                </div>
            </header>

            {/* Dashboard Grid */}
            <main className="flex-1 p-8">
                <div className="grid grid-cols-12 gap-6 max-w-7xl mx-auto h-full min-h-[600px]">
                    
                    {/* Left Column: Mastery & Cognitive State (Span 4) */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex-1">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Target className="text-indigo-400" size={18} /> Cognitive State
                            </h2>
                            {cognitiveState ? (
                                <>
                                    <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                                        A reflection of your structural knowledge in the current project, balancing theoretical understanding with recall strength.
                                    </p>
                                    
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Focus Area: {cognitiveState.highestRisk.name}</span>
                                                <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20">High Risk</span>
                                            </div>
                                            <MasteryMeter 
                                                understandingScore={cognitiveState.highestRisk.understandingScore}
                                                recallScore={cognitiveState.highestRisk.recallScore}
                                                masteryLevel={cognitiveState.highestRisk.masteryLevel}
                                            />
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Strongest: {cognitiveState.best.name}</span>
                                            </div>
                                            <MasteryMeter 
                                                understandingScore={cognitiveState.best.understandingScore}
                                                recallScore={cognitiveState.best.recallScore}
                                                masteryLevel={cognitiveState.best.masteryLevel}
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-600 text-xs italic">
                                    Insufficient data to map cognitive state. Continue building to generate insights.
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Middle Column: Architectural Heatmap (Span 4) */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                        <section className="flex-1">
                            {heatmapData.length > 0 ? (
                                <ArchitecturalHeatmap data={heatmapData} />
                            ) : (
                                <div className="h-full bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-600 text-xs italic p-10 text-center">
                                    No architectural metrics detected. Run the stress analyzer to populate this map.
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right Column: Concept Timeline (Span 4) */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                        <section className="flex-1 overflow-y-auto">
                            <ConceptTimelineWidget changes={conceptChanges} />
                        </section>
                    </div>

                </div>
            </main>
        </div>
    );
}
