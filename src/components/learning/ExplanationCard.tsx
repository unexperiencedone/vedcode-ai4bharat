"use client";

import { Brain, Code, FileText, ChevronRight, Activity, X, Loader2 } from "lucide-react";
import { MarkdownRenderer } from "../ui/MarkdownRenderer";
import { MasteryMeter } from "../intelligence/MasteryMeter";
import { GapAlert } from "../intelligence/GapAlert";
import { RecallPrompter } from "../intelligence/RecallPrompter";
import { ReadinessCheck } from "../intelligence/ReadinessCheck";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface MasteryData {
  understanding: number;
  recall: number;
  level: string;
  nextReviewAt?: Date | null;
  groundingScore?: number;
  isProjectSynced?: boolean;
}

interface ExplanationCardProps {
  keyword: string;
  explanation: {
    theory: string;
    snippet: string;
    language: string;
    projectApplication: string;
  } | null;
  gaps?: any[];
  mastery?: MasteryData;
}

export function ExplanationCard({
  keyword,
  explanation,
  gaps = [],
  mastery,
}: ExplanationCardProps) {
  const [hasProceeded, setHasProceeded] = useState(false);
  const [recallChallenge, setRecallChallenge] = useState<any>(null);
  const [recallLoading, setRecallLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [answerResult, setAnswerResult] = useState<{correct: boolean; message: string} | null>(null);
  const [isLoggedToMemory, setIsLoggedToMemory] = useState(mastery?.understanding ? mastery.understanding > 0 : false);
  const { data: session } = useSession();

  // Reset state when keyword changes
  useEffect(() => {
    setHasProceeded(false);
    setRecallChallenge(null);
    setUserAnswer("");
    setAnswerResult(null);
    setIsLoggedToMemory(mastery?.understanding ? mastery.understanding > 0 : false);
  }, [keyword, mastery]);

  const handleLogToMemory = async () => {
    if (isLoggedToMemory) return;
    if (!session?.user?.id) return;
    setIsLoggedToMemory(true);
    try {
      // Send manual "log to memory" signal to start Ebbinghaus tracking
      fetch("/api/learner/signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: session.user.id,
          signalType: "concept_viewed",
          payload: { manualLog: true, keyword }
        })
      }).catch(console.error);
    } catch(e) {
      console.error(e);
      setIsLoggedToMemory(false);
    }
  };

  const handleStartChallenge = async () => {
    setRecallLoading(true);
    try {
      const res = await fetch("/api/learn/recall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keywords: [keyword],
          context: explanation?.theory?.slice(0, 500) ?? "",
        }),
      });
      const data = await res.json();
      setRecallChallenge(data.challenge);
    } catch (error) {
      console.error(error);
    } finally {
      setRecallLoading(false);
    }
  };

  const submitChallengeAnswer = async (selectedOpt?: string) => {
    if (!recallChallenge) return;
    
    const submitted = selectedOpt ?? userAnswer.trim();
    if (!submitted) return;

    let correct = false;
    let message = "";

    if (recallChallenge.type === "free-text") {
      try {
        setRecallLoading(true);
        const res = await fetch("/api/learn/grade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: recallChallenge.question,
            correctAnswer: recallChallenge.correctAnswer,
            userAnswer: submitted
          }),
        });
        const gradingResult = await res.json();
        correct = gradingResult.correct;
        message = gradingResult.message;
      } catch (err) {
        correct = submitted.length > 5;
        message = correct ? "Answer recorded." : "Please expand your reasoning.";
      } finally {
        setRecallLoading(false);
      }
    } else {
      // Exact match for multi-choice or code-completion
      correct = submitted.toLowerCase() === recallChallenge.correctAnswer.toLowerCase();
      message = correct ? "Correct! Well done." : `Incorrect. The correct answer was: ${recallChallenge.correctAnswer}`;
    }

    setAnswerResult({ correct, message });

    // Send result to the inference engine to adjust Ebbinghaus 
    if (session?.user?.id) {
      try {
        await fetch("/api/learner/signal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileId: session.user.id,
            conceptId: keyword,
            signalType: "quiz_answered",
            payload: {
               correct,
               difficulty: "beginner" 
            }
          })
        });
      } catch (error) {
        console.error("Failed to sync answer:", error);
      }
    }
  };

  if (!keyword) return null;

  const showReadinessCheck = gaps.length > 0 && !hasProceeded;

  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {showReadinessCheck ? (
        <ReadinessCheck
          conceptName={keyword}
          gaps={gaps}
          onProceed={() => setHasProceeded(true)}
        />
      ) : (
        <>
          {/* ⚠️ Gap Alert */}
          {hasProceeded && gaps.length > 0 && <GapAlert gaps={gaps} />}

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col gap-1">
              <div className="text-[10px] uppercase text-indigo-400 font-bold tracking-[0.2em] mb-1">
                Concept Deep Dive
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                {keyword}
              </h2>
              <button
                onClick={handleLogToMemory}
                disabled={isLoggedToMemory}
                className={cn(
                  "mt-2 px-3 py-1 text-xs font-bold rounded-full transition-all flex items-center gap-1.5",
                  isLoggedToMemory
                    ? "bg-indigo-500/20 text-indigo-300 cursor-not-allowed border border-indigo-500/30"
                    : "bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white border border-white/10"
                )}
              >
                <Activity size={12} />
                {isLoggedToMemory ? "Logged to Memory Tracking" : "Start Tracking (Log to Memory)"}
              </button>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  Grounding Status
                </span>
                <div className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                  mastery?.isProjectSynced 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                )}>
                  {mastery?.isProjectSynced ? "Project Synced" : "Global Knowledge"}
                </div>
              </div>
              <span className="text-[10px] text-neutral-600 font-mono mt-1">
                Verified against current codebase
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-8">
              {/* 1. Contextual Snippet - ONLY CODE */}
              <div className="bg-[#0d0d0d] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                 <div className="px-6 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                       <Code size={14} className="text-indigo-400" />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Contextual Snippet</span>
                    </div>
                    <span className="text-[9px] font-mono text-neutral-600 uppercase">Live Code Reference</span>
                 </div>
                 <div className="p-0">
                    {explanation?.snippet ? (
                      <MarkdownRenderer content={"```" + (explanation.language || 'typescript') + "\n" + explanation.snippet + "\n```"} className="prose-p:hidden prose-h3:hidden" />
                    ) : (
                      <div className="p-8 text-neutral-600 text-xs italic font-mono">No relevant snippet found in grounding.</div>
                    )}
                 </div>
              </div>

              {/* 2. Theory & Application */}
              <div className="space-y-6">
                <div className="bg-[#0a0a0a]/50 border border-white/5 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <FileText className="w-4 h-4 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Conceptual Theory</h3>
                  </div>
                  <MarkdownRenderer content={explanation?.theory || ""} />
                </div>

                <div className="bg-indigo-500/[0.03] border border-indigo-500/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                      <Activity className="w-4 h-4 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Project Application</h3>
                  </div>
                  <MarkdownRenderer content={explanation?.projectApplication || ""} />
                </div>
              </div>
            </div>

            {/* Sidebar Personalized Insights */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-[#0a0a0a]/80 border border-white/5 rounded-2xl p-6 shadow-xl sticky top-24">
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <Brain className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-sm font-bold text-white tracking-tight">
                    Learner Stats
                  </span>
                </div>

                <div className="space-y-8">
                  {/* Mastery Meter */}
                  {mastery && mastery.level !== 'unexplored' ? (
                    <MasteryMeter
                      understandingScore={mastery.understanding}
                      recallScore={mastery.recall}
                      masteryLevel={mastery.level}
                    />
                  ) : (
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                      <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest mb-1">Status</p>
                      <p className="text-xs text-neutral-400">First time exploring this concept.</p>
                    </div>
                  )}

                  {/* Real Grounding Metric */}
                  <div className="pt-4 border-t border-white/5">
                    <div className="text-[10px] uppercase text-neutral-500 font-bold mb-4 tracking-widest">
                      Grounding Confidence
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col gap-1">
                         <div className="flex items-center justify-between text-[10px] font-bold">
                            <span className="text-neutral-400">Reference Quality</span>
                            <span className={cn(
                              mastery?.groundingScore && mastery.groundingScore > 70 ? "text-emerald-400" : "text-amber-400"
                            )}>{mastery?.groundingScore || 0}%</span>
                         </div>
                         <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-1">
                            <div 
                              className="h-full bg-indigo-500" 
                              style={{ width: `${mastery?.groundingScore || 0}%` }}
                            />
                         </div>
                      </div>
                      
                      <div className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5 text-[10px] text-neutral-400 flex items-center justify-between">
                         AST Mapping
                         <span className="text-indigo-400 font-mono text-[9px]">{mastery?.isProjectSynced ? "ACTIVE" : "NONE"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 🔁 Recall Prompter */}
      {mastery && (
        <RecallPrompter
          conceptName={keyword}
          recallScore={mastery.recall}
          nextReviewAt={mastery.nextReviewAt}
          onStartChallenge={handleStartChallenge}
        />
      )}

      {/* Recall challenge modal */}
      {(recallLoading || recallChallenge) && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg mx-4 bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl p-6">
            <button
              onClick={() => { setRecallChallenge(null); setAnswerResult(null); setUserAnswer(""); }}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Brain size={16} className="text-indigo-400" />
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Active Recall · {keyword}</span>
            </div>

            {recallLoading ? (
              <div className="flex items-center gap-3 text-slate-400 py-4">
                <Loader2 size={18} className="animate-spin" />
                Generating a spaced-repetition challenge...
              </div>
            ) : recallChallenge ? (
              <>
                <p className="text-white text-sm leading-relaxed mb-4">{recallChallenge.question}</p>

                {/* Question Types UI */}
                {!answerResult ? (
                  <div className="space-y-4">
                    {recallChallenge.type === "multiple-choice" && recallChallenge.options?.map((opt: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => submitChallengeAnswer(opt)}
                        className="w-full text-left p-3 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-indigo-500/10 hover:border-indigo-500/30 text-slate-200 text-sm transition-all"
                      >
                        {opt}
                      </button>
                    ))}

                    {recallChallenge.type === "code-completion" && recallChallenge.snippet && (
                       <div className="bg-black/50 p-4 rounded-lg font-mono text-sm border border-slate-800 mb-4 whitespace-pre-wrap">
                          {recallChallenge.snippet.split("__BLANK__").map((part: string, index: number, arr: any[]) => (
                             <span key={index}>
                               {part}
                               {index < arr.length - 1 && (
                                  <input 
                                    autoFocus
                                    className="bg-slate-800 border-b border-indigo-400 text-indigo-300 focus:outline-none px-1 py-0.5 mx-1 w-24 text-center"
                                    value={userAnswer}
                                    onChange={e => setUserAnswer(e.target.value)}
                                    placeholder="?????"
                                  />
                               )}
                             </span>
                          ))}
                       </div>
                    )}

                    {(recallChallenge.type === "free-text" || recallChallenge.type === "code-completion") && (
                      <div className="flex flex-col gap-3 mt-4">
                        {recallChallenge.type === "free-text" && (
                          <textarea
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            rows={4}
                            placeholder="Type your answer here..."
                            className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
                          />
                        )}
                        <button
                          onClick={() => submitChallengeAnswer()}
                          disabled={!userAnswer.trim()}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                          Submit Answer
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={cn(
                    "mt-4 p-4 rounded-xl border text-sm font-medium",
                    answerResult.correct 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                  )}>
                    {answerResult.correct ? "✓ " : "✗ "} {answerResult.message}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
