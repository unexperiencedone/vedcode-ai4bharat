"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { GitCommit, Plus, Minus, RefreshCw, AlertTriangle, ChevronRight } from 'lucide-react';

export interface ConceptChange {
    id: string;
    commitHash: string;
    conceptName: string;
    changeType: 'introduced' | 'modified' | 'removed';
    confidence: number;
    timestamp: Date;
    hasRegressionRisk?: boolean; // Flagged by RegressionCorrelationEngine
}

const TYPE_CONFIG = {
    introduced: { icon: Plus, bgColor: "bg-emerald-500/10", color: "text-emerald-400" },
    removed: { icon: Minus, bgColor: "bg-rose-500/10", color: "text-rose-400" },
    modified: { icon: RefreshCw, bgColor: "bg-blue-500/10", color: "text-blue-400" }
};

export function ConceptTimelineWidget({ changes }: { changes: ConceptChange[] }) {
    
    if (!changes || changes.length === 0) return null;

    // Group by commit
    const groupedChanges = changes.reduce((acc, change) => {
        if (!acc[change.commitHash]) acc[change.commitHash] = [];
        acc[change.commitHash].push(change);
        return acc;
    }, {} as Record<string, ConceptChange[]>);

    return (
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-5 text-white">
            <h3 className="text-sm font-bold tracking-wide uppercase text-slate-400 mb-6 flex items-center gap-2">
                <GitCommit size={16} /> Concept Evolution Timeline
            </h3>

            <div className="relative border-l border-slate-800 ml-3 space-y-8">
                {Object.entries(groupedChanges).map(([hash, commitChanges], idx) => (
                    <motion.div 
                        key={hash}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="relative pl-6"
                    >
                        {/* Commit Node Point */}
                        <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-slate-700 border-2 border-slate-900" />
                        
                        <div className="text-xs font-mono text-slate-500 mb-3 flex items-center gap-2">
                            Commit {hash.substring(0, 7)}
                            <span className="text-slate-700 mx-1">•</span>
                            {new Date(commitChanges[0].timestamp).toLocaleDateString()}
                        </div>

                        <div className="space-y-3">
                            {commitChanges.map(change => {
                                const Config = TYPE_CONFIG[change.changeType];
                                const Icon = Config.icon;

                                return (
                                    <div key={change.id} className={`flex flex-col gap-2 p-3 rounded-lg border \${change.hasRegressionRisk ? 'border-amber-500/30 bg-amber-500/5' : 'border-slate-800 bg-slate-800/20'}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1 rounded-md \${Config.bgColor} \${Config.color}`}>
                                                    <Icon size={14} />
                                                </div>
                                                <span className="font-semibold text-sm">{change.conceptName}</span>
                                            </div>
                                            <span className="text-[10px] text-slate-500 font-mono">
                                                CONF: {(change.confidence * 100).toFixed(0)}%
                                            </span>
                                        </div>

                                        {change.hasRegressionRisk && (
                                            <div className="flex items-start gap-2 mt-2 pt-2 border-t border-amber-500/20 text-xs text-amber-400">
                                                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                                                <p>High-risk concept injection. Your mastery of this pattern is unverified.</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
