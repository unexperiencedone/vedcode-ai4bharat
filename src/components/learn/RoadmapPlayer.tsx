"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  CheckCircle2,
  Lock,
  PlayCircle,
  BookOpen,
  Code2,
  ArrowRight,
} from "lucide-react";
// Mock import bypassed for UI demo. In production, this imports the DB fetcher.

interface LessonContent {
  id: string;
  concept: string;
  title: string;
  type: "theory" | "interactive";
  description: string;
  codeSnippet?: string;
}

const MOCK_ROADMAP: LessonContent[] = [
  {
    id: "L1",
    concept: "async_await",
    title: "The Async/Await Foundation",
    type: "theory",
    description:
      "Understand how JavaScript handles promises under the hood and why await prevents the thread from blocking.",
  },
  {
    id: "L2",
    concept: "error_handling",
    title: "Safeguarding Asynchronous Execution",
    type: "interactive",
    description:
      "Wrap the previous fetch call in a robust try/catch block. Ensure the UI can recover from a 500 error gracefully.",
    codeSnippet: `// Exercise: Add error handling\nasync function fetchUserData(uid: string) {\n  const res = await fetch(\`/api/users/\${uid}\`);\n  const data = await res.json();\n  return data;\n}`,
  },
  {
    id: "L3",
    concept: "promise_all",
    title: "Parallelism for Performance",
    type: "theory",
    description:
      "When independent async calls are bottlenecking your app, Promise.all runs them concurrently.",
  },
];

export function RoadmapPlayer() {
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [quizMode, setQuizMode] = useState(false);

  // Mock mastery context for the demo
  const [userMastery, setUserMastery] = useState<Record<string, number>>({
    async_await: 0.8,
    error_handling: 0.3,
    promise_all: 0.0,
  });

  const activeLesson = MOCK_ROADMAP[activeLessonIndex];

  const simulateTopicCompletion = () => {
    // Increment mastery locally to simulate the engine updating recall_score
    setUserMastery((prev) => ({
      ...prev,
      [activeLesson.concept]: Math.min(
        (prev[activeLesson.concept] || 0) + 0.5,
        1.0,
      ),
    }));
    setQuizMode(false);
    if (activeLessonIndex < MOCK_ROADMAP.length - 1) {
      setActiveLessonIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="flex h-full w-full bg-[#0a0f18] text-foreground p-6 gap-6 custom-scrollbar overflow-auto">
      {/* The Curriculum Graph Panel */}
      <div className="w-1/3 bg-slate-900/50 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shrink-0">
        <div className="p-5 border-b border-slate-800 bg-slate-900/80">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-1">
            <Target className="text-indigo-400" size={20} /> Asynchronous
            Patterns
          </h2>
          <p className="text-sm text-slate-400">
            Curated specifically based on your recent architectural struggles.
          </p>
        </div>

        <div className="p-5 space-y-4">
          {MOCK_ROADMAP.map((lesson, idx) => {
            const mastery = userMastery[lesson.concept] || 0;
            const isUnlocked =
              idx === 0 ||
              (userMastery[MOCK_ROADMAP[idx - 1].concept] || 0) >= 0.6;
            const isActive = activeLessonIndex === idx;

            return (
              <div
                key={lesson.id}
                onClick={() => isUnlocked && setActiveLessonIndex(idx)}
                className={`relative p-4 rounded-xl border transition-all \${
                                    isActive 
                                    ? 'bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                                    : isUnlocked 
                                        ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 cursor-pointer' 
                                        : 'bg-slate-900/50 border-slate-800 opacity-50 cursor-not-allowed'
                                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {mastery >= 0.8 ? (
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    ) : !isUnlocked ? (
                      <Lock size={16} className="text-slate-500" />
                    ) : (
                      <PlayCircle size={16} className="text-indigo-400" />
                    )}
                    <span
                      className={`text-sm font-semibold \${isActive ? 'text-indigo-300' : 'text-slate-200'}`}
                    >
                      {lesson.title}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-slate-400">
                    {lesson.type}
                  </span>
                </div>

                {isUnlocked && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-1 flex-1 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full \${mastery >= 0.8 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        style={{ width: mastery * 100 + "%" }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {Math.round(mastery * 100)}%
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* The Active Lesson / Quiz Panel */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden relative shadow-2xl">
        <AnimatePresence mode="wait">
          {!quizMode ? (
            <motion.div
              key="lesson"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full"
            >
              <div className="p-8 border-b border-slate-800">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-4 uppercase tracking-wider">
                  {activeLesson.type === "theory" ? (
                    <BookOpen size={14} />
                  ) : (
                    <Code2 size={14} />
                  )}
                  {activeLesson.type} module
                </span>
                <h1 className="text-3xl font-bold text-white mb-4">
                  {activeLesson.title}
                </h1>
                <p className="text-lg text-slate-300 leading-relaxed max-w-2xl">
                  {activeLesson.description}
                </p>
              </div>

              {activeLesson.codeSnippet && (
                <div className="flex-1 p-8 bg-[#0a0f18] border-b border-slate-800 font-mono text-sm text-slate-300 overflow-auto">
                  <pre>
                    <code>{activeLesson.codeSnippet}</code>
                  </pre>
                </div>
              )}

              <div className="p-6 bg-slate-900 flex justify-end shrink-0">
                <button
                  onClick={() => setQuizMode(true)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  Start Interactive Check <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col h-full p-8 items-center justify-center text-center"
            >
              <Target size={48} className="text-indigo-400 mb-6" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Recall Challenge
              </h2>
              <p className="text-slate-400 mb-8 max-w-md">
                Applying concept:{" "}
                <span className="text-indigo-300 font-mono">
                  {activeLesson.concept}
                </span>
              </p>

              <div className="w-full max-w-2xl bg-[#0a0f18] border border-slate-800 rounded-xl p-6 mb-8 text-left">
                <p className="text-slate-300 font-medium mb-4">
                  Which of the following correctly catches an error from an
                  awaited Promise?
                </p>
                <div className="space-y-3">
                  <button className="w-full text-left p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-slate-300 transition-colors">
                    <code className="text-sm">await fetch().catch()</code>
                  </button>
                  <button
                    onClick={simulateTopicCompletion} // Simulating correct answer
                    className="w-full text-left p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-slate-300 transition-colors"
                  >
                    <code className="text-sm">
                      try &#123; await fetch() &#125; catch (e) &#123;&#125;
                    </code>
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Completing this challenge will increase your Recall Score,
                unlocking the next module.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
