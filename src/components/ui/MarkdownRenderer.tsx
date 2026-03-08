"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("text-neutral-200 text-sm leading-relaxed prose prose-invert prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({
            node,
            inline,
            className,
            children,
            ...props
          }: any) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <div className="my-4 rounded-xl border border-white/5 overflow-hidden shadow-2xl">
                <div className="bg-[#1a1a1a] px-4 py-1.5 border-b border-white/5 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                    {match[1]}
                  </span>
                </div>
                <SyntaxHighlighter
                  language={match[1]}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: "1.25rem",
                    fontSize: "0.85rem",
                    background: "#0d0d0d",
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code
                className="bg-white/10 text-indigo-300 px-1.5 py-0.5 rounded text-[0.9em] font-mono font-medium"
                {...props}
              >
                {children}
              </code>
            );
          },
          p: ({ children }) => (
            <p className="mb-4 last:mb-0 opacity-90 leading-relaxed font-sans">
              {children}
            </p>
          ),
          h3: ({ children }) => (
            <h3 className="text-white font-bold mt-6 mb-3 first:mt-0 text-base">
              {children}
            </h3>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 mb-4 space-y-2 opacity-90">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mb-4 space-y-2 opacity-90">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="pl-1">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-indigo-500/50 bg-indigo-500/5 px-4 py-2 my-4 rounded-r-lg italic text-neutral-300">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
