"use client";

import { useState } from "react";
import { KeywordSearch } from "@/components/learning/KeywordSearch";
import { ExplanationCard } from "@/components/learning/ExplanationCard";

export default function LearnPage() {
  const [keyword, setKeyword] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (term: string) => {
    setKeyword(term);
    setIsLoading(true);
    setExplanation(null);
    try {
      const res = await fetch("/api/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: term }),
      });
      const data = await res.json();
      setExplanation(data.explanation);
    } catch (e) {
      setExplanation("Error loading context. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
            Enter any framework concept, architecture pattern, or file name. Learn specifically how it works inside this codebase.
          </p>
          <KeywordSearch onSearch={handleSearch} isLoading={isLoading} />
        </div>
      )}

      {keyword && (
        <div className="w-full flex flex-col gap-6">
          <div className="flex items-center justify-between animate-in fade-in duration-300">
            <button 
              onClick={() => { setKeyword(null); setExplanation(null); }}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-md transition-colors"
            >
              ← Back to Search
            </button>
          </div>
          
          {isLoading && !explanation ? (
            <div className="w-full h-64 flex flex-col items-center justify-center border border-border/50 bg-card/50 rounded-xl animate-pulse">
               <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
               <p className="text-muted-foreground animate-pulse">Running Code-First retrieval...</p>
            </div>
          ) : (
            <ExplanationCard keyword={keyword} explanation={explanation} />
          )}
        </div>
      )}
    </div>
  );
}
