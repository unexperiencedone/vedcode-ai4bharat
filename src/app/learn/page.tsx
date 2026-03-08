"use client";

import { useState, useEffect } from "react";
import { KeywordSearch } from "@/components/learning/KeywordSearch";
import { ExplanationCard } from "@/components/learning/ExplanationCard";
import { useChat } from "@/components/providers/ChatProvider";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import { useSession } from "next-auth/react";

interface LearnState {
  keyword: string | null;
  explanation: any;
  gaps: any[];
  mastery: any;
}

export default function LearnPage() {
  const { data: session } = useSession();
  const { setPageContext } = useChat();
  const [isLoading, setIsLoading] = useState(false);

  // Persist learn state across navigations (no TTL — persists until cleared)
  const [learnState, setLearnState] = useLocalStorage<LearnState>(
    "vedcode_learn_state",
    { keyword: null, explanation: null, gaps: [], mastery: null }
  );

  const { keyword, explanation, gaps, mastery } = learnState;

  // Sync keyword with global chat context for persistent awareness
  useEffect(() => {
    setPageContext({ searchKeyword: keyword || undefined });
  }, [keyword, setPageContext]);

  const handleSearch = async (term: string) => {
    setLearnState({ keyword: term, explanation: null, gaps: [], mastery: null });
    setIsLoading(true);
    try {
      const user = session?.user as any;
      const profileId = user?.id || "00000000-0000-0000-0000-000000000000";

      const res = await fetch("/api/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: term, profileId }),
      });
      const data = await res.json();

      if (
        data.source === "knowledge_base" ||
        data.source === "grounded_llm" ||
        data.source === "llm_fallback"
      ) {
        setLearnState({
          keyword: term,
          explanation: data.explanation,
          gaps: data.gaps || [],
          mastery: data.mastery,
        });
      }
    } catch (e) {
      setLearnState((prev) => ({
        ...prev,
        explanation: { theory: "Error loading context. Please try again.", snippet: "", language: "text", projectApplication: "" },
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setLearnState({ keyword: null, explanation: null, gaps: [], mastery: null });
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto p-8 lg:p-12 flex flex-col pt-16 mt-8">
      {!keyword && (
        <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in duration-700">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
            <span className="text-3xl font-bold text-primary">A</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3 text-center">
            Keyword to Understanding
          </h1>
          <p className="text-muted-foreground mb-12 text-center max-w-md">
            Enter any framework concept, architecture pattern, or file name.
            Learn specifically how it works inside this codebase.
          </p>
          <KeywordSearch onSearch={handleSearch} isLoading={isLoading} />
        </div>
      )}

      {keyword && (
        <div className="w-full flex flex-col gap-6">
          <div className="flex items-center justify-between animate-in fade-in duration-300">
            <button
              onClick={handleBack}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-md transition-colors"
            >
              ← Back to Search
            </button>
          </div>

          {isLoading && !explanation ? (
            <div className="w-full h-64 flex flex-col items-center justify-center border border-border/50 bg-card/50 rounded-xl animate-pulse">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
              <p className="text-muted-foreground animate-pulse">
                Running Code-First retrieval...
              </p>
            </div>
          ) : (
            <ExplanationCard
              keyword={keyword}
              explanation={explanation}
              gaps={gaps}
              mastery={mastery}
            />
          )}
        </div>
      )}
    </div>
  );
}
