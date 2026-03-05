'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Target } from 'lucide-react';

interface MasteryMeterProps {
    understandingScore: number; // 0 to 1
    recallScore: number;        // 0 to 1
    masteryLevel?: string;
}

export const MasteryMeter: React.FC<MasteryMeterProps> = ({ 
    understandingScore, 
    recallScore,
    masteryLevel = 'learning'
}) => {
    // Mastery formula: (U * 0.45) + (R * 0.55)
    const masteryScore = (understandingScore * 0.45) + (recallScore * 0.55);
    const masteryPercent = Math.round(masteryScore * 100);

    const uPercent = Math.round(understandingScore * 100);
    const rPercent = Math.round(recallScore * 100);

    return (
        <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <Target className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold">Concept Mastery</h3>
                        <p className="text-xs text-slate-400 capitalize">{masteryLevel} phase</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-bold text-white">{masteryPercent}%</span>
                </div>
            </div>

            {/* Understanding Bar */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                        <Brain className="w-3 h-3 text-emerald-400" />
                        Understanding
                    </div>
                    <span className="text-[10px] text-slate-500">{uPercent}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${uPercent}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-emerald-500/50 to-emerald-400"
                    />
                </div>
            </div>

            {/* Recall Bar */}
            <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                        <Zap className="w-3 h-3 text-amber-400" />
                        Recall Strength
                    </div>
                    <span className="text-[10px] text-slate-500">{rPercent}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${rPercent}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-amber-500/50 to-amber-400"
                    />
                </div>
            </div>

            {/* Cognitive Status */}
            <div className="mt-6 pt-4 border-t border-white/5">
                <p className="text-[11px] text-slate-400 leading-relaxed italic">
                    {masteryPercent < 40 ? 
                        "You've started building the foundation. Focus on theory and examples to grow understanding." :
                        masteryPercent < 70 ? 
                        "Good comprehension! Try a quick quiz to cement this into your long-term memory." :
                        "Mastery achieved. This concept is now a permanent part of your developer intuition."
                    }
                </p>
            </div>
        </div>
    );
};
