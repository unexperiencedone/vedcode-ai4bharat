"use client";

import React from "react";
import { Sparkles, Trash2, ArrowUp, ArrowDown, Check, GraduationCap } from "lucide-react";
import type { RoadmapStep } from "@/db/schema";
import { cn } from "@/lib/utils";

interface RoadmapPreviewProps {
  steps: RoadmapStep[];
  title: string;
  isSaving: boolean;
  onReorder: (startIndex: number, endIndex: number) => void;
  onRemove: (index: number) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function RoadmapPreview({ steps, title, isSaving, onReorder, onRemove, onSave, onCancel }: RoadmapPreviewProps) {
  
  const moveUp = (idx: number) => {
    if (idx > 0) onReorder(idx, idx - 1);
  };
  
  const moveDown = (idx: number) => {
    if (idx < steps.length - 1) onReorder(idx, idx + 1);
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f18] text-foreground p-8 overflow-y-auto custom-scrollbar">
      <div className="max-w-3xl mx-auto w-full">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">Review Your Path</h2>
            </div>
            <p className="text-slate-400">
              Veda has curated this exact sequence of concepts to help you achieve your goal. 
              Review the steps, make adjustments if needed, and save it to your profile.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onCancel}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onSave}
              disabled={isSaving || steps.length === 0}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]"
            >
              {isSaving ? "Saving..." : "Looks good, Save Roadmap"}
              <Check size={16} />
            </button>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center mb-6">
            <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
            <p className="text-sm text-slate-500">{steps.length} Chapters</p>
          </div>

          {steps.map((step, idx) => (
            <div 
              key={`${step.slug}-${idx}`}
              className="flex items-stretch gap-4 p-4 rounded-xl bg-slate-800/20 border border-slate-700/50 hover:border-indigo-500/30 transition-colors group"
            >
              <div className="flex flex-col items-center justify-center border-r border-slate-700/50 pr-4 shrink-0 w-16">
                <span className="text-2xl font-bold text-slate-600 group-hover:text-indigo-500/50 transition-colors">
                  {idx + 1}
                </span>
              </div>
              
              <div className="flex-1 py-1">
                <h4 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <GraduationCap size={16} className="text-indigo-400" />
                  {step.name}
                </h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {step.reasoning}
                </p>
              </div>

              <div className="flex flex-col gap-1 pl-4 border-l border-slate-700/50 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 transition-colors"
                >
                  <ArrowUp size={16} />
                </button>
                <button 
                  onClick={() => onRemove(idx)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
                <button 
                  onClick={() => moveDown(idx)}
                  disabled={idx === steps.length - 1}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 transition-colors"
                >
                  <ArrowDown size={16} />
                </button>
              </div>
            </div>
          ))}

          {steps.length === 0 && (
            <div className="p-12 text-center text-slate-500 border border-dashed border-slate-700 rounded-xl">
              You removed all steps! Please cancel and generate a new roadmap.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
