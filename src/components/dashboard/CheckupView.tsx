"use client";

import React, { useState } from 'react';
import { Sparkles, Activity, BrainCircuit, Columns, Target } from 'lucide-react';
import { MasteryMeter } from '../intelligence/MasteryMeter';
import { ConceptTimelineWidget, ConceptChange } from '../ui/ConceptTimelineWidget';
import { ArchitecturalHeatmap } from './ArchitecturalHeatmap';

// Mock Data for the demonstration of the Checkup Dashboard
const mockHeatmapData = [
    { name: 'src/lib/auth/authMiddleware.ts', stressScore: 0.85, couplingSize: 14 },
    { name: 'src/components/App.tsx', stressScore: 0.62, couplingSize: 8 },
    { name: 'src/lib/api/socketClient.ts', stressScore: 0.78, couplingSize: 11 },
    { name: 'src/utils/formatters.ts', stressScore: 0.12, couplingSize: 2 },
    { name: 'src/db/schema.ts', stressScore: 0.45, couplingSize: 15 },
    { name: 'src/components/ui/Button.tsx', stressScore: 0.05, couplingSize: 32 },
];

const mockConceptChanges: ConceptChange[] = [
    {
        id: '1',
        commitHash: 'a91f3cb',
        conceptName: 'Promise Chains',
        changeType: 'introduced',
        confidence: 0.95,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
        id: '2',
        commitHash: 'f72aa9e',
        conceptName: 'Async / Await',
        changeType: 'introduced',
        confidence: 0.92,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
        id: '3',
        commitHash: 'f72aa9e',
        conceptName: 'Promise Chains',
        changeType: 'removed',
        confidence: 0.88,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
        id: '4',
        commitHash: 'f72aa9e',
        conceptName: 'Async Error Handling',
        changeType: 'removed', // or omitted in code
        confidence: 0.65,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        hasRegressionRisk: true
    }
];

export function CheckupView() {
    // Top-level mastery metrics for the user's focus concepts
    const highestRiskConcept = {
        name: 'Async Error Propagation',
        understandingScore: 0.45,
        recallScore: 0.20,
        masteryLevel: 'struggling'
    };

    const bestConcept = {
        name: 'React Server Components',
        understandingScore: 0.88,
        recallScore: 0.92,
        masteryLevel: 'mastered'
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0f18] text-foreground overflow-y-auto">
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
                            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                                A reflection of your structural knowledge in the current project, balancing theoretical understanding with recall strength.
                            </p>
                            
                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Focus Area: {highestRiskConcept.name}</span>
                                        <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20">High Risk</span>
                                    </div>
                                    <MasteryMeter 
                                        understandingScore={highestRiskConcept.understandingScore}
                                        recallScore={highestRiskConcept.recallScore}
                                        masteryLevel={highestRiskConcept.masteryLevel}
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Strongest: {bestConcept.name}</span>
                                    </div>
                                    <MasteryMeter 
                                        understandingScore={bestConcept.understandingScore}
                                        recallScore={bestConcept.recallScore}
                                        masteryLevel={bestConcept.masteryLevel}
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Middle Column: Architectural Heatmap (Span 4) */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                        <section className="flex-1">
                            {/* We just directly mount the component we built */}
                            <ArchitecturalHeatmap data={mockHeatmapData} />
                        </section>
                    </div>

                    {/* Right Column: Concept Timeline (Span 4) */}
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                        <section className="flex-1 overflow-y-auto">
                            <ConceptTimelineWidget changes={mockConceptChanges} />
                        </section>
                    </div>

                </div>
            </main>
        </div>
    );
}
