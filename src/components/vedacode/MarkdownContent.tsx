"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";
import { highlightKeywords } from "@/components/documentExplainer/KeywordTooltip";

// @ts-ignore
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// @ts-ignore
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

// ─── Code Block (matches DocReadingMode exactly) ──────────────────────────────

function CodeBlock({ language, value }: { language: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-6 group/code overflow-hidden rounded-2xl border border-white/[0.08] shadow-2xl">
      <div className="bg-[#0f172a] h-10 flex items-center justify-between px-5 border-b border-white/[0.05]">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-white"
        >
          {copied ? (
            <Check size={13} className="text-emerald-500" />
          ) : (
            <Copy size={13} />
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: "1.25rem",
          background: "#020617",
          fontSize: "0.83rem",
          lineHeight: "1.7",
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}

// ─── Recursive keyword highlighter for React node trees ───────────────────────
// Walks React children: applies highlightKeywords() to raw strings,
// leaves elements (strong, code, etc.) untouched to avoid double-wrapping.

function applyKeywords(
  children: React.ReactNode,
  keywords: Record<string, string>
): React.ReactNode {
  if (!keywords || Object.keys(keywords).length === 0) return children;

  if (typeof children === "string") {
    const result = highlightKeywords(children, keywords);
    // highlightKeywords returns string[] | ReactNode[] — wrap in fragment
    return <>{result}</>;
  }

  if (Array.isArray(children)) {
    return children.map((child, i) =>
      typeof child === "string"
        ? <React.Fragment key={i}>{highlightKeywords(child, keywords)}</React.Fragment>
        : child
    );
  }

  return children;
}

// ─── Component factory (keywords in closure) ──────────────────────────────────

function makeComponents(keywords: Record<string, string>) {
  const kw = keywords;

  return {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      const lang  = match ? match[1] : "";
      const value = String(children).replace(/\n$/, "");

      if (!inline && (match || value.includes("\n"))) {
        return <CodeBlock language={lang} value={value} />;
      }
      return (
        <code
          className="px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-300 font-mono text-[0.85em]"
          {...props}
        >
          {children}
        </code>
      );
    },

    p({ children }: any) {
      return (
        <p className="text-slate-300 leading-[1.85] mb-5 text-[0.97rem]">
          {applyKeywords(children, kw)}
        </p>
      );
    },

    li({ children }: any) {
      return (
        <li className="text-slate-300 text-[0.97rem] leading-relaxed">
          {applyKeywords(children, kw)}
        </li>
      );
    },

    h1({ children }: any) {
      return <h1 className="text-2xl font-bold text-white mt-10 mb-4">{children}</h1>;
    },
    h2({ children }: any) {
      return <h2 className="text-xl font-bold text-white mt-8 mb-3">{children}</h2>;
    },
    h3({ children }: any) {
      return <h3 className="text-lg font-semibold text-slate-200 mt-6 mb-2">{children}</h3>;
    },
    ul({ children }: any) {
      return <ul className="space-y-1.5 my-4 pl-6 list-disc marker:text-slate-600">{children}</ul>;
    },
    ol({ children }: any) {
      return <ol className="space-y-1.5 my-4 pl-6 list-decimal marker:text-slate-500">{children}</ol>;
    },
    blockquote({ children }: any) {
      return (
        <blockquote className="border-l-4 border-blue-500/60 bg-blue-500/5 pl-5 pr-4 py-3 my-5 rounded-r-xl text-slate-400 italic">
          {children}
        </blockquote>
      );
    },
    strong({ children }: any) {
      return <strong className="font-semibold text-white">{children}</strong>;
    },
    hr() {
      return <hr className="my-8 border-slate-800" />;
    },
    table({ children }: any) {
      return (
        <div className="overflow-x-auto my-6 rounded-xl border border-slate-800">
          <table className="w-full text-sm text-slate-300">{children}</table>
        </div>
      );
    },
    thead({ children }: any) {
      return <thead className="bg-slate-800/60 text-slate-400 text-xs uppercase tracking-widest">{children}</thead>;
    },
    th({ children }: any) {
      return <th className="px-4 py-3 text-left font-semibold">{children}</th>;
    },
    td({ children }: any) {
      return <td className="px-4 py-3 border-t border-slate-800">{children}</td>;
    },
  };
}

// ─── Public component ─────────────────────────────────────────────────────────

interface MarkdownContentProps {
  content: string;
  keywords?: Record<string, string>;
  className?: string;
}

export default function MarkdownContent({ content, keywords = {}, className }: MarkdownContentProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={makeComponents(keywords) as any}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
