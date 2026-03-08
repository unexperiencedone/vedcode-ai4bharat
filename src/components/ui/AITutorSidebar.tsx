"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { MarkdownRenderer } from "./MarkdownRenderer";
import "katex/dist/katex.min.css";

import {
  MessageSquare,
  Code2,
  BrainCircuit,
  Target,
  Send,
  ShieldAlert,
  User,
  Sparkles,
  ChevronDown,
  History,
  Plus,
} from "lucide-react";
import { ReasoningContext } from "@/lib/types/tutor";
import { getTutorReasoning } from "@/lib/actions/tutorActions";
import { useChat } from "@/components/providers/ChatProvider";
import { cn } from "@/lib/utils";

export function AITutorSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    sessions,
    currentSessionId,
    isThinking,
    isLoading,
    sendMessage,
    switchSession,
    createNewSession,
  } = useChat();

  const [width, setWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [input, setInput] = useState("");
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  // Resizing logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 280 && newWidth <= 800) {
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "default";
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;
    const currentInput = input;
    setInput("");
    await sendMessage(currentInput, pathname, getTutorReasoning);
  };

  const latestContext = messages
    .filter((m) => m.contextUsed)
    .pop()?.contextUsed;

  return (
    <div
      className="h-full bg-background border-l border-white/5 flex flex-col shadow-2xl shrink-0 selection:bg-indigo-500/30 relative"
      style={{ width: `${width}px` }}
    >
      {/* Resizer Handle */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 cursor-col-resize z-50 transition-colors hover:bg-indigo-500/30",
          isResizing && "bg-indigo-500/50",
        )}
        onMouseDown={(e) => {
          e.preventDefault();
          setIsResizing(true);
        }}
      />

      {/* Context Header */}

      <div className="shrink-0 border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              showHistory
                ? "bg-indigo-500/20 text-indigo-400"
                : "text-neutral-500 hover:bg-white/5 hover:text-white",
            )}
            title="Chat History"
          >
            <History size={16} />
          </button>
          <button
            onClick={() => {
              createNewSession();
              setShowHistory(false);
            }}
            className="p-1.5 rounded-md text-neutral-500 hover:bg-white/5 hover:text-white transition-colors"
            title="New Chat"
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <BrainCircuit className="text-indigo-400 w-4 h-4" />
            </div>
            <div className="text-left">
              <h3 className="text-xs font-bold text-white tracking-tight uppercase opacity-80">
                Mentor Context
              </h3>
              <p className="text-[10px] text-neutral-500 font-mono mt-0.5 truncate max-w-[180px]">
                {pathname}
              </p>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-neutral-600 transition-transform duration-300",
              isHeaderExpanded && "rotate-180",
            )}
          />
        </button>

        <AnimatePresence>
          {isHeaderExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3">
                {/* Mastery Context */}
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-[10px] uppercase text-neutral-500 font-bold mb-2 flex items-center gap-1.5">
                    <Target size={10} className="text-indigo-400" /> Active
                    Mastery
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {(latestContext?.conceptsInFile || []).map((c) => {
                      const score = latestContext?.userMastery[c] || 0.5;
                      return (
                        <div
                          key={c}
                          className="px-2 py-1 rounded-md bg-white/[0.03] border border-white/5 text-[10px] text-neutral-300 flex items-center gap-1.5 hover:border-indigo-500/30 transition-colors"
                        >
                          {c}
                          <div
                            className={cn(
                              "w-1 h-1 rounded-full",
                              score > 0.6 ? "bg-emerald-400" : "bg-neutral-600",
                            )}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {latestContext?.intent && (
                  <div className="p-2 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                    <div className="text-[10px] uppercase text-indigo-400 font-bold flex items-center gap-1.5">
                      <ShieldAlert size={10} /> Intent:{" "}
                      <span className="text-neutral-300 capitalize font-medium">
                        {latestContext.intent}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Chat History / Sessions List */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-white/5 bg-white/[0.01] overflow-hidden max-h-[300px] flex flex-col"
          >
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
              <div className="text-[10px] uppercase text-neutral-500 font-bold px-2 mb-2 flex items-center gap-1.5">
                Recent Conversations
              </div>
              {sessions.length === 0 ? (
                <div className="text-xs text-neutral-600 px-2 py-4 text-center">
                  No past conversations yet.
                </div>
              ) : (
                sessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      switchSession(s.id);
                      setShowHistory(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2.5 rounded-lg text-xs transition-all flex flex-col gap-1 border border-transparent",
                      currentSessionId === s.id
                        ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                        : "text-neutral-400 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    <div className="font-medium truncate">{s.title}</div>
                    <div className="text-[10px] opacity-40 font-mono">
                      {new Date(s.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                ))
              )}
            </div>
            <div className="p-2 border-t border-white/5 bg-black/20 flex justify-center">
              <button
                onClick={() => setShowHistory(false)}
                className="text-[10px] text-neutral-500 hover:text-neutral-300 uppercase tracking-widest font-bold"
              >
                Close History
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 space-y-8">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row",
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border mt-1",
                    msg.role === "user"
                      ? "bg-neutral-800 border-white/10"
                      : "bg-indigo-600/10 border-indigo-500/20",
                  )}
                >
                  {msg.role === "user" ? (
                    <User size={14} className="text-neutral-400" />
                  ) : (
                    <Sparkles size={14} className="text-indigo-400" />
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={cn(
                    "max-w-[85%] group relative",
                    msg.role === "user" ? "text-right" : "text-left",
                  )}
                >
                  {msg.role === "user" ? (
                    <div className="inline-block p-3.5 rounded-2xl bg-indigo-600 text-white text-sm shadow-lg shadow-indigo-500/10">
                      {msg.content}
                    </div>
                  ) : (
                    <MarkdownRenderer content={msg.content} />
                  )}

                  {/* Timestamp/Label could go here */}
                </div>
              </motion.div>
            ))}

            {isThinking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <Sparkles
                    size={14}
                    className="text-indigo-400 animate-pulse"
                  />
                </div>
                <div className="bg-white/[0.03] border border-white/5 p-3.5 rounded-2xl flex items-center gap-1.5">
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
                  />
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                    className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
                  />
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                    className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background border-t border-white/5 sticky bottom-0 z-20">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300" />
          <div className="relative flex flex-col bg-card border border-white/10 rounded-xl overflow-hidden focus-within:border-indigo-500/40 transition-all">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask your mentor..."
              className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none resize-none max-h-32 custom-scrollbar"
            />
            <div className="flex items-center justify-between px-3 py-2 bg-white/[0.02] border-t border-white/5">
              <span className="text-[10px] text-neutral-600 font-medium">
                Shift + Enter for newline
              </span>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isThinking}
                className="p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 disabled:opacity-50 disabled:bg-neutral-800 transition-all active:scale-95"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
