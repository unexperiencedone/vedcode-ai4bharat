'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, X, BrainCircuit, CheckCircle2 } from 'lucide-react';

interface RecallPrompterProps {
    conceptName: string;
    recallScore: number;
    onStartChallenge: () => void;
}

export const RecallPrompter: React.FC<RecallPrompterProps> = ({ 
    conceptName, 
    recallScore,
    onStartChallenge
}) => {
    const [isVisible, setIsVisible] = useState(recallScore < 0.45);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed bottom-8 right-8 z-50 max-w-sm w-full"
            >
                <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-[0_0_50px_rgba(99,102,241,0.2)] overflow-hidden">
                    <div className="bg-indigo-600/10 px-4 py-3 flex items-center justify-between border-b border-indigo-500/20">
                        <div className="flex items-center gap-2">
                            <BrainCircuit className="w-4 h-4 text-indigo-400 font-bold" />
                            <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Active Recall</span>
                        </div>
                        <button 
                            onClick={() => setIsVisible(false)}
                            className="text-slate-500 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-5">
                        <h4 className="text-white font-medium text-sm mb-2">
                            Knowledge is fading...
                        </h4>
                        <p className="text-slate-400 text-xs leading-relaxed mb-6">
                            You learned <span className="text-indigo-300 font-semibold">{conceptName}</span> recently, but your recall strength is dipping. A 15-second retrieval challenge will lock it in.
                        </p>

                        <div className="flex flex-col gap-2">
                            <button 
                                onClick={onStartChallenge}
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 group"
                            >
                                <RefreshCcw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
                                Start Retrieval Challenge
                            </button>
                            <button 
                                onClick={() => setIsVisible(false)}
                                className="w-full py-2 text-[10px] text-slate-500 hover:text-slate-300 transition-colors uppercase font-bold tracking-widest"
                            >
                                Not now
                            </button>
                        </div>
                    </div>

                    {/* Progress indicator */}
                    <div className="h-1 w-full bg-slate-800">
                        <motion.div 
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: 10, ease: "linear" }}
                            onAnimationComplete={() => setIsVisible(false)}
                            className="h-full bg-indigo-500"
                        />
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
