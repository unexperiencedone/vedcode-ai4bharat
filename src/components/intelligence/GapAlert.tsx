'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ChevronRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface Gap {
    missingConceptId: string;
    name: string;
    slug: string;
    masteryLevel: string;
}

interface GapAlertProps {
    gaps: Gap[];
}

export const GapAlert: React.FC<GapAlertProps> = ({ gaps }) => {
    if (!gaps || gaps.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 mb-8 overflow-hidden relative"
            >
                {/* Accent Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl -mr-16 -mt-16 rounded-full" />
                
                <div className="flex items-start gap-4 relative z-10">
                    <div className="p-2 bg-amber-500/20 rounded-xl mt-1">
                        <ShieldAlert className="w-5 h-5 text-amber-500" />
                    </div>
                    
                    <div className="flex-1">
                        <h3 className="text-amber-200 font-semibold text-sm mb-1">Concept Gap Detected</h3>
                        <p className="text-amber-200/60 text-xs leading-relaxed mb-4">
                            Our intelligence engine suggests you might struggle with this topic. 
                            Consider reviewing these prerequisites first:
                        </p>
                        
                        <div className="flex flex-wrap gap-2">
                            {gaps.map((gap) => (
                                <Link 
                                    key={gap.missingConceptId} 
                                    href={`/learn?concept=${gap.slug}`}
                                    className="group flex items-center gap-2 bg-slate-900/80 border border-white/5 hover:border-amber-500/30 px-3 py-2 rounded-lg transition-all duration-300"
                                >
                                    <BookOpen className="w-3 h-3 text-amber-500/70 group-hover:text-amber-500" />
                                    <span className="text-[11px] text-slate-300 group-hover:text-white font-medium">
                                        {gap.name}
                                    </span>
                                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
