import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, BookOpen, ArrowRight, X } from 'lucide-react';

interface PreFlightGatewayProps {
    filePath: string;
    metrics: {
        stressScore: number;
        learningGaps: string[];
    };
    onAcknowledge: () => void;
    onCancel: () => void;
}

export function PreFlightGateway({ filePath, metrics, onAcknowledge, onCancel }: PreFlightGatewayProps) {
    const filename = filePath.split('/').pop() || filePath;

    // Only show the gateway if the file is highly stressed or has specific learning gaps
    if (metrics.stressScore < 0.6 && metrics.learningGaps.length === 0) {
        // In a real app, this would probably bypass immediately instead of rendering nothing.
        // For demonstration, we simply won't render the blocker.
        return null; 
    }

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl relative"
            >
                <button 
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-amber-500/20 text-amber-500 rounded-xl">
                        <ShieldAlert size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Pre-Flight Check</h2>
                        <p className="text-sm font-mono text-slate-400 mt-1">{filename}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {metrics.stressScore >= 0.6 && (
                        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-slate-200 mb-1 flex items-center gap-2">
                                <ActivityIndicator score={metrics.stressScore} /> 
                                High Architectural Stress
                            </h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                This module has a stress score of {(metrics.stressScore * 100).toFixed(0)}. It is tightly coupled to several other components. Proceed with caution when refactoring.
                            </p>
                        </div>
                    )}

                    {metrics.learningGaps.length > 0 && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-blue-300 mb-2 flex items-center gap-2">
                                <BookOpen size={16} /> 
                                Learning Context
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed mb-3">
                                This file relies heavily on concepts you've struggled with recently. Would you like a quick primer before editing?
                            </p>
                            <div className="flex gap-2 flex-wrap">
                                {metrics.learningGaps.map(gap => (
                                    <span key={gap} className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-slate-300">
                                        {gap}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex gap-3">
                    <button 
                        onClick={onAcknowledge}
                        className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
                    >
                        Proceed to Editor <ArrowRight size={16} />
                    </button>
                    {metrics.learningGaps.length > 0 && (
                        <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors border border-slate-700">
                            Review Primer
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

function ActivityIndicator({ score }: { score: number }) {
    const color = score > 0.8 ? 'bg-rose-500' : 'bg-amber-500';
    return (
        <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 \${color}`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 \${color}`}></span>
        </span>
    );
}
