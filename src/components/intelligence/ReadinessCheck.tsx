'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, ArrowRight, Info } from 'lucide-react';

interface Gap {
    name: string;
    slug: string;
}

interface ReadinessCheckProps {
    conceptName: string;
    gaps: Gap[];
    onProceed: () => void;
}

export const ReadinessCheck: React.FC<ReadinessCheckProps> = ({ 
    conceptName, 
    gaps, 
    onProceed 
}) => {
    if (!gaps || gaps.length === 0) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden"
        >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent pointer-none" />
            
            <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 border border-amber-500/20">
                    <Lock className="w-8 h-8 text-amber-500" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">Wait, Are You Ready?</h2>
                <p className="text-slate-400 text-sm max-w-md mb-8">
                    <span className="text-white font-semibold">{conceptName}</span> builds on top of concepts you haven't mastered yet. Jumping ahead might make learning harder.
                </p>

                <div className="w-full max-w-sm bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-6 mb-8 text-left">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Info className="w-3 h-3" />
                        Prerequisites Needed
                    </h3>
                    <ul className="space-y-3">
                        {gaps.map((gap, i) => (
                            <motion.li 
                                key={gap.slug}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-center gap-3 text-sm text-slate-300"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
                                {gap.name}
                            </motion.li>
                        ))}
                    </ul>
                </div>

                <div className="flex flex-col w-full max-w-sm gap-3">
                    <button 
                        onClick={onProceed}
                        className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-2xl transition-all border border-white/5"
                    >
                        Explain it anyway
                    </button>
                    <button 
                        onClick={() => window.location.href = `/learn?concept=${gaps[0].slug}`}
                        className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 group"
                    >
                        Review Prerequisite first
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
