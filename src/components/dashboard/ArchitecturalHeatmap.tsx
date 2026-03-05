import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

interface ModuleStress {
    name: string;
    stressScore: number; // 0 to 1
    couplingSize: number;
}

export function ArchitecturalHeatmap({ data }: { data: ModuleStress[] }) {
    if (!data || data.length === 0) return null;

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white h-full flex flex-col">
            <h3 className="text-sm font-bold tracking-wide uppercase text-slate-400 mb-6 flex items-center gap-2">
                <Activity size={16} /> Architectural Heatmap
            </h3>

            <div className="flex-1 grid grid-cols-3 gap-3 overflow-y-auto pr-2 custom-scrollbar">
                {data.map((mod, idx) => {
                    // Determine color based on stress
                    let bgColor = 'bg-slate-800/50';
                    let borderColor = 'border-slate-700';
                    let textColor = 'text-slate-300';

                    if (mod.stressScore > 0.8) {
                        bgColor = 'bg-rose-500/20';
                        borderColor = 'border-rose-500/40';
                        textColor = 'text-rose-300';
                    } else if (mod.stressScore > 0.5) {
                        bgColor = 'bg-amber-500/20';
                        borderColor = 'border-amber-500/40';
                        textColor = 'text-amber-300';
                    } else {
                        bgColor = 'bg-emerald-500/10';
                        borderColor = 'border-emerald-500/20';
                        textColor = 'text-emerald-400';
                    }

                    // Size could optionally be tied to couplingSize, but for a grid we keep it uniform
                    return (
                        <motion.div
                            key={mod.name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`p-4 rounded-xl border \${bgColor} \${borderColor} flex flex-col justify-between`}
                        >
                            <div className="text-sm font-medium truncate mb-2" title={mod.name}>
                                {mod.name.split('/').pop()}
                            </div>
                            <div className="flex items-end justify-between">
                                <span className={`text-2xl font-bold \${textColor}`}>
                                    {(mod.stressScore * 100).toFixed(0)}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono uppercase">
                                    Coupling: {mod.couplingSize}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-medium uppercase tracking-wider">
                <span>Healthy {'<'} 50</span>
                <span>Warning 50-80</span>
                <span>Critical {'>'} 80</span>
            </div>
        </div>
    );
}

