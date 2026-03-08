"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, CheckCircle2, ChevronRight, Loader2, Code2, RefreshCw, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonPanelProps {
  lesson: {
    slug: string;
    name: string;
    reasoning: string;
    orderIndex: number;
  };
  techSlug: string;
  profileId: string;
  isLastLesson: boolean;
  onComplete: () => void;
}

type Phase = "explaining" | "answered_quiz" | "challenge" | "done";

interface QuizData {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export function LessonPanel({ lesson, techSlug, profileId, isLastLesson, onComplete }: LessonPanelProps) {
  const [phase, setPhase] = useState<Phase>("explaining");
  const [explanation, setExplanation] = useState<{ theory: string; snippet: string; language: string; projectApplication: string } | null>(null);
  const [explainLoading, setExplainLoading] = useState(true);
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [challengeSelected, setChallengeSelected] = useState<number | null>(null);
  const [challengeAnswered, setChallengeAnswered] = useState(false);
  const [challengeCorrect, setChallengeCorrect] = useState(false);

  // Reset all state when lesson changes
  useEffect(() => {
    setPhase("explaining");
    setExplanation(null);
    setExplainLoading(true);
    setQuiz(null);
    setSelected(null);
    setAnswered(false);
    setChallengeSelected(null);
    setChallengeAnswered(false);
    setChallengeCorrect(false);
    fetchExplanation();
  }, [lesson.slug]);

  async function fetchExplanation() {
    setExplainLoading(true);
    try {
      const res = await fetch("/api/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: lesson.name, profileId }),
      });
      const data = await res.json();
      setExplanation(data.explanation);
    } catch (e) {
      setExplanation({ theory: "Could not load explanation. Check your connection.", snippet: "", language: "typescript", projectApplication: "" });
    } finally {
      setExplainLoading(false);
    }
  }

  async function fetchQuiz() {
    setQuizLoading(true);
    try {
      const res = await fetch("/api/learn/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ techSlug, conceptSlug: lesson.slug, conceptName: lesson.name }),
      });
      const data = await res.json();
      setQuiz(data);
    } catch (e) {
      console.error("Quiz fetch failed", e);
    } finally {
      setQuizLoading(false);
    }
  }

  function moveToAnsweredQuiz() {
    setPhase("answered_quiz");
    fetchQuiz();
  }

  function moveToChallenge() {
    setPhase("challenge");
    setChallengeSelected(null);
    setChallengeAnswered(false);
    setChallengeCorrect(false);
  }

  function submitChallenge(idx: number) {
    if (challengeAnswered) return;
    setChallengeSelected(idx);
    setChallengeAnswered(true);
    const correct = idx === quiz!.correctIndex;
    setChallengeCorrect(correct);
    if (correct) {
      setTimeout(() => {
        setPhase("done");
        onComplete();
      }, 1500);
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Phase indicator */}
      <div className="flex items-center gap-2 px-8 py-3 border-b border-slate-800 bg-slate-900/50 shrink-0">
        {(["explaining", "answered_quiz", "challenge"] as Phase[]).map((p, i) => (
          <React.Fragment key={p}>
            <div className={cn(
              "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full transition-all",
              phase === p ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40" :
              ["answered_quiz", "challenge"].indexOf(p) <= ["answered_quiz", "challenge"].indexOf(phase as any)
                ? "text-emerald-400" : "text-slate-600"
            )}>
              {i + 1}. {p === "explaining" ? "Learn" : p === "answered_quiz" ? "Study Quiz" : "Challenge"}
            </div>
            {i < 2 && <div className="flex-1 h-px bg-slate-800" />}
          </React.Fragment>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <AnimatePresence mode="wait">

          {/* ── PHASE 1: EXPLAIN ── */}
          {phase === "explaining" && (
            <motion.div key="explain" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-8">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={16} className="text-indigo-400" />
                <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">Concept · {techSlug}</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">{lesson.name}</h1>
              <p className="text-sm text-indigo-300/70 mb-8 italic">Why you need this: {lesson.reasoning}</p>

              {explainLoading ? (
                <div className="flex items-center gap-3 text-slate-400">
                  <Loader2 size={18} className="animate-spin text-indigo-400" />
                  <span className="text-sm">Veda is preparing your explanation...</span>
                </div>
              ) : explanation ? (
                <div className="space-y-6">
                  {/* Theory */}
                  <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed">
                    {explanation.theory}
                  </div>

                  {/* Code snippet */}
                  {explanation.snippet && (
                    <div className="rounded-xl bg-slate-900/50 border border-slate-700/50 overflow-hidden">
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border-b border-slate-700/50">
                        <Code2 size={13} className="text-slate-500" />
                        <span className="text-xs text-slate-500 font-mono">{explanation.language || "code"}</span>
                      </div>
                      <pre className="p-5 text-sm text-slate-300 font-mono overflow-x-auto">
                        <code>{explanation.snippet}</code>
                      </pre>
                    </div>
                  )}

                  {/* Project application */}
                  {explanation.projectApplication && (
                    <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/15">
                      <p className="text-xs uppercase tracking-wider text-indigo-400 font-semibold mb-1">How this applies</p>
                      <p className="text-sm text-slate-300">{explanation.projectApplication}</p>
                    </div>
                  )}
                </div>
              ) : null}

              <div className="flex justify-end mt-10">
                <button
                  onClick={moveToAnsweredQuiz}
                  disabled={explainLoading}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(79,70,229,0.25)]"
                >
                  I understand this <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── PHASE 2: ANSWERED QUIZ (study mode) ── */}
          {phase === "answered_quiz" && (
            <motion.div key="answered" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xs bg-amber-500/10 text-amber-400 font-semibold uppercase tracking-wider px-3 py-1 rounded-full ring-1 ring-amber-500/20">
                  Study Quiz — answers visible
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-8">Study the correct answer and its explanation before the challenge.</p>

              {quizLoading ? (
                <div className="flex items-center gap-3 text-slate-400">
                  <Loader2 size={18} className="animate-spin text-amber-400" />
                  <span className="text-sm">Generating your study question...</span>
                </div>
              ) : quiz ? (
                <div className="space-y-6">
                  <p className="text-lg text-white font-medium leading-relaxed">{quiz.question}</p>

                  <div className="space-y-3">
                    {quiz.options.map((opt, i) => (
                      <div key={i} className={cn(
                        "p-4 rounded-xl border text-sm transition-all",
                        i === quiz.correctIndex
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                          : "bg-slate-800/30 border-slate-700/40 text-slate-400"
                      )}>
                        <div className="flex items-center gap-3">
                          {i === quiz.correctIndex
                            ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                            : <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0" />
                          }
                          {opt}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Why this is correct</p>
                    <p className="text-sm text-slate-300">{quiz.explanation}</p>
                  </div>
                </div>
              ) : (
                <p className="text-red-400 text-sm">Failed to load quiz. <button onClick={fetchQuiz} className="underline">Retry</button></p>
              )}

              <div className="flex justify-end mt-10">
                <button
                  onClick={moveToChallenge}
                  disabled={quizLoading || !quiz}
                  className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold transition-all"
                >
                  Challenge me <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── PHASE 3: UNANSWERED RECALL CHALLENGE ── */}
          {phase === "challenge" && quiz && (
            <motion.div key="challenge" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xs bg-rose-500/10 text-rose-400 font-semibold uppercase tracking-wider px-3 py-1 rounded-full ring-1 ring-rose-500/20">
                  Recall Challenge
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-8">Pick the correct answer without hints.</p>

              <p className="text-lg text-white font-medium leading-relaxed mb-6">{quiz.question}</p>

              <div className="space-y-3">
                {quiz.options.map((opt, i) => {
                  let style = "bg-slate-800/40 border-slate-700/50 text-slate-300 hover:border-indigo-500/50 hover:bg-indigo-500/5 cursor-pointer";
                  if (challengeAnswered) {
                    if (i === quiz.correctIndex) style = "bg-emerald-500/10 border-emerald-500/40 text-emerald-300";
                    else if (i === challengeSelected) style = "bg-red-500/10 border-red-500/40 text-red-300";
                    else style = "bg-slate-800/20 border-slate-800 text-slate-600";
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => submitChallenge(i)}
                      disabled={challengeAnswered}
                      className={cn("w-full p-4 rounded-xl border text-sm text-left transition-all", style)}
                    >
                      <div className="flex items-center gap-3">
                        {challengeAnswered && i === quiz.correctIndex && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
                        {challengeAnswered && i === challengeSelected && i !== quiz.correctIndex && <XCircle size={16} className="text-red-400 shrink-0" />}
                        {opt}
                      </div>
                    </button>
                  );
                })}
              </div>

              {challengeAnswered && !challengeCorrect && (
                <div className="mt-6 space-y-4">
                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                    <p className="text-sm text-red-300 mb-1 font-semibold">Not quite.</p>
                    <p className="text-sm text-slate-400">{quiz.explanation}</p>
                  </div>
                  <button
                    onClick={moveToChallenge}
                    className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <RefreshCw size={14} /> Try again
                  </button>
                </div>
              )}

              {challengeAnswered && challengeCorrect && (
                <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 size={16} /> Correct! Moving to next concept...
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
