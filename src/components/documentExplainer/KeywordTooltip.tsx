"use client";

import React, { useState, useRef, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Utility: split text by matched keywords and return mixed string/ReactNode array
// ─────────────────────────────────────────────────────────────────────────────

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function highlightKeywords(
  text: string,
  keywords: Record<string, string>
): React.ReactNode[] {
  const terms = Object.keys(keywords);
  if (!terms.length || !text || typeof text !== "string") return [text];

  // Build a regex that matches any of the keyword terms (word boundaries, case-insensitive)
  const pattern = new RegExp(
    `\\b(${terms.map(escapeRegex).join("|")})\\b`,
    "gi"
  );

  const parts = text.split(pattern);

  return parts.map((part, i) => {
    const matched = terms.find((t) => t.toLowerCase() === part.toLowerCase());
    if (matched) {
      return (
        <KeywordTooltip key={i} term={part} definition={keywords[matched]} />
      );
    }
    return part;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// KeywordTooltip: the highlighted word with its hover popup
// ─────────────────────────────────────────────────────────────────────────────

interface KeywordTooltipProps {
  term: string;
  definition: string;
}

export function KeywordTooltip({ term, definition }: KeywordTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<"top" | "bottom">("top");
  const spanRef = useRef<HTMLSpanElement>(null);

  const handleMouseEnter = () => {
    if (spanRef.current) {
      const rect = spanRef.current.getBoundingClientRect();
      // If there's not enough room above, show below
      setPos(rect.top < 100 ? "bottom" : "top");
    }
    setVisible(true);
  };

  return (
    <span
      ref={spanRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setVisible(false)}
      style={{ position: "relative", display: "inline" }}
      className="keyword-highlight"
    >
      <span
        className={[
          "inline px-0.5 rounded cursor-help font-semibold transition-all duration-150",
          "text-blue-300 underline decoration-dotted decoration-blue-400/50 underline-offset-2",
          "hover:bg-blue-500/10 hover:text-blue-200",
        ].join(" ")}
      >
        {term}
      </span>

      {visible && (
        <span
          className={[
            "keyword-tooltip absolute z-50 w-64 px-4 py-3 rounded-xl",
            "bg-[#0f172a] border border-blue-500/20 shadow-2xl shadow-blue-900/40",
            "text-xs text-slate-300 font-normal leading-relaxed pointer-events-none",
            "animate-in fade-in zoom-in-95 duration-150",
            pos === "top"
              ? "bottom-full mb-2 left-1/2 -translate-x-1/2"
              : "top-full mt-2 left-1/2 -translate-x-1/2",
          ].join(" ")}
          style={{ whiteSpace: "normal", fontFamily: "inherit" }}
        >
          {/* Arrow */}
          <span
            className={[
              "absolute left-1/2 -translate-x-1/2 w-0 h-0",
              "border-x-4 border-x-transparent",
              pos === "top"
                ? "top-full border-t-4 border-t-[#0f172a]"
                : "bottom-full border-b-4 border-b-[#0f172a]",
            ].join(" ")}
          />
          <span className="font-bold text-blue-400 block mb-1">{term}</span>
          {definition}
        </span>
      )}
    </span>
  );
}
