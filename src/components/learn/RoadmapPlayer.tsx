"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Lock,
  PlayCircle,
  CheckCircle2,
  Target,
  Loader2,
  Sparkles,
  Trophy,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { RoadmapGenerator } from "../learning/RoadmapGenerator";
import { RoadmapPreview } from "./RoadmapPreview";
import { LessonPanel } from "./LessonPanel";
import type { RoadmapStep } from "@/db/schema";
import { cn } from "@/lib/utils";

type PlayerMode =
  | "loading"
  | "dashboard"
  | "previewing"
  | "learning"
  | "completed";

export function RoadmapPlayer() {
  const { data: session } = useSession();
  const profileId = (session?.user as any)?.id;
  const [mode, setMode] = useState<PlayerMode>("loading");

  // All roadmaps
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [showGenerator, setShowGenerator] = useState(false);

  // Active roadmap data (for learning mode)
  const [roadmapId, setRoadmapId] = useState<string | null>(null);
  const [roadmapTitle, setRoadmapTitle] = useState("");
  const [roadmapGoal, setRoadmapGoal] = useState("");
  const [techSlug, setTechSlug] = useState("");
  const [steps, setSteps] = useState<RoadmapStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. On mount: Load existing active roadmaps
  useEffect(() => {
    if (!profileId) return;
    loadRoadmaps();
  }, [profileId]);

  const loadRoadmaps = async () => {
    try {
      const res = await fetch("/api/roadmap/mine");
      const data = await res.json();

      const actives =
        data.roadmaps?.filter((r: any) => r.status === "active") || [];
      setRoadmaps(actives);
      setMode("dashboard");

      // Auto-show generator if no roadmaps exist
      if (actives.length === 0) {
        setShowGenerator(true);
      }
    } catch (e) {
      console.error(e);
      setMode("dashboard");
    }
  };

  const openRoadmap = (roadmap: any) => {
    setRoadmapId(roadmap.id);
    setRoadmapTitle(roadmap.title);
    setRoadmapGoal(roadmap.goal);
    setTechSlug(roadmap.techSlug);
    setSteps(roadmap.steps);
    setCurrentStepIndex(roadmap.currentStepIndex || 0);
    setMode("learning");
  };

  // 2. AI generates new roadmap → Preview mode
  const handleGenerated = (customRoadmap: any) => {
    const rd = customRoadmap.roadmap || customRoadmap;
    setRoadmapTitle(rd.title || "Custom AI Learning Path");
    setSteps(rd.steps || []);
    setTechSlug(customRoadmap.techSlug || "nextjs");
    setMode("previewing");
  };

  // 3. User saves previewed roadmap
  const handleSaveRoadmap = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/roadmap/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: roadmapTitle,
          goal: roadmapTitle, // We use title as goal context fallback
          techSlug: techSlug,
          steps,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Add to local state and open it immediately
      setRoadmaps((prev) => [data.roadmap, ...prev]);
      setShowGenerator(false);
      openRoadmap(data.roadmap);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  // 4. User completes a lesson
  const handleLessonComplete = async () => {
    if (currentStepIndex === steps.length - 1) {
      // Complete entire roadmap
      await fetch("/api/roadmap/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roadmapId }),
      });
      // Update local state to remove completed roadmap from actives
      setRoadmaps((prev) => prev.filter((r) => r.id !== roadmapId));
      setMode("completed");
    } else {
      // Advance to next step
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);

      // Save progress and silently update the roadmaps array state
      fetch("/api/roadmap/mine", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roadmapId, currentStepIndex: nextIndex }),
      }).then(() => {
        setRoadmaps((prev) =>
          prev.map((r) =>
            r.id === roadmapId ? { ...r, currentStepIndex: nextIndex } : r,
          ),
        );
      });
    }
  };

  if (mode === "loading") {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (mode === "dashboard") {
    return (
      <div className="flex flex-col h-full bg-background p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Target className="text-indigo-400 w-8 h-8" /> Learning Journey
              </h1>
              <p className="text-slate-400 mt-2">
                Manage your active learning paths and track your progress.
              </p>
            </div>
            {!showGenerator && (
              <button
                onClick={() => setShowGenerator(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
              >
                <Plus size={18} /> New Roadmap
              </button>
            )}
          </div>

          <AnimatePresence>
            {showGenerator && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Create a Path
                  </h3>
                  {roadmaps.length > 0 && (
                    <button
                      onClick={() => setShowGenerator(false)}
                      className="text-sm text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  )}
                </div>
                <RoadmapGenerator onRoadmapGenerated={handleGenerated} />
              </motion.div>
            )}
          </AnimatePresence>

          {roadmaps.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {roadmaps.map((roadmap) => {
                const totalSteps = roadmap.steps?.length || 1;
                const progress =
                  ((roadmap.currentStepIndex || 0) / totalSteps) * 100;

                return (
                  <div
                    key={roadmap.id}
                    onClick={() => openRoadmap(roadmap)}
                    className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 cursor-pointer hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all group relative overflow-hidden"
                  >
                    {/* Topic Badge */}
                    <div className="absolute top-4 right-4 bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold capitalize border border-indigo-500/20">
                      {roadmap.techSlug}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 pr-20 line-clamp-2 leading-tight group-hover:text-indigo-300 transition-colors">
                      {roadmap.title}
                    </h3>

                    <div className="mt-8">
                      <div className="flex justify-between items-center mb-2 text-sm">
                        <span className="text-slate-400 font-medium">
                          Chapter {roadmap.currentStepIndex + 1} of {totalSteps}
                        </span>
                        <span className="text-indigo-400 font-bold">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {roadmaps.length === 0 && !showGenerator && (
            <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl">
              <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-slate-300">
                No active roadmaps
              </h2>
              <p className="text-slate-500 mt-2">
                Generate a personalized curriculum to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (mode === "previewing") {
    return (
      <RoadmapPreview
        title={roadmapTitle}
        steps={steps}
        isSaving={isSaving}
        onCancel={() => setMode("dashboard")}
        onSave={handleSaveRoadmap}
        onRemove={(idx) => setSteps((s) => s.filter((_, i) => i !== idx))}
        onReorder={(start, end) => {
          const newSteps = [...steps];
          const [moved] = newSteps.splice(start, 1);
          newSteps.splice(end, 0, moved);
          setSteps(newSteps);
        }}
      />
    );
  }

  if (mode === "completed") {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto ring-4 ring-emerald-500/30">
            <Trophy className="w-12 h-12 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-white">Roadmap Mastered!</h2>
          <p className="text-slate-400 leading-relaxed">
            You've completed all topics in <strong>{roadmapTitle}</strong>. Your
            learner graph and mastery score have been updated.
          </p>
          <button
            onClick={() => setMode("dashboard")}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all"
          >
            Back to Journey
          </button>
        </div>
      </div>
    );
  }

  // mode === "learning"
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header bar for learning view */}
      <div className="h-16 px-6 border-b border-slate-800/50 flex items-center justify-between shrink-0 bg-slate-900/30 backdrop-blur-md">
        <button
          onClick={() => setMode("dashboard")}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
          <Target className="text-indigo-400 w-5 h-5" />
          <span className="text-white font-semibold truncate max-w-md">
            {roadmapTitle}
          </span>
          <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase mapping-widest ml-2">
            {techSlug}
          </span>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden p-6 gap-6 relative">
        {/* Left Sidebar: Curriculum list */}
        <div className="w-1/3 max-w-sm bg-slate-900/50 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shrink-0 shadow-lg relative z-10">
          <div className="p-5 border-b border-slate-800 bg-slate-900/80">
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-lg font-bold text-white">Curriculum</h2>
              <span className="text-xs font-medium text-slate-500">
                {currentStepIndex + 1} / {steps.length}
              </span>
            </div>

            {/* Local Progress Bar */}
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStepIndex / steps.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {steps.map((step, idx) => {
              const isUnlocked = idx <= currentStepIndex;
              const isActive = idx === currentStepIndex;
              const isDone = idx < currentStepIndex;

              return (
                <div
                  key={`${step.slug}-${idx}`}
                  onClick={() => isUnlocked && setCurrentStepIndex(idx)}
                  className={cn(
                    "relative p-3.5 rounded-xl border transition-all duration-200",
                    isActive
                      ? "bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                      : isDone
                        ? "bg-emerald-500/5 border-emerald-500/20 cursor-pointer hover:bg-emerald-500/10"
                        : isUnlocked
                          ? "bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 cursor-pointer"
                          : "bg-slate-900/30 border-slate-800/50 opacity-50 cursor-not-allowed",
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      {isDone ? (
                        <CheckCircle2
                          size={18}
                          className="text-emerald-400 shrink-0"
                        />
                      ) : !isUnlocked ? (
                        <Lock size={16} className="text-slate-500 shrink-0" />
                      ) : (
                        <PlayCircle
                          size={18}
                          className="text-indigo-400 shrink-0"
                        />
                      )}
                      <span
                        className={cn(
                          "text-sm font-semibold leading-tight",
                          isActive
                            ? "text-indigo-300"
                            : isDone
                              ? "text-slate-300"
                              : "text-slate-400",
                        )}
                      >
                        {step.name}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: The actual lesson view */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative z-20">
          <LessonPanel
            key={steps[currentStepIndex].slug}
            lesson={steps[currentStepIndex]}
            techSlug={techSlug}
            profileId={profileId}
            isLastLesson={currentStepIndex === steps.length - 1}
            onComplete={handleLessonComplete}
          />
        </div>
      </div>
    </div>
  );
}
