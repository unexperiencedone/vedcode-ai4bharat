"use client";

import { useState } from "react";
import { Copy, Terminal, Monitor, Code } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComponentSandboxProps {
  initialCode: string;
  title: string;
  description: string;
  type: string;
}

export function ComponentSandbox({ initialCode, title, description, type }: ComponentSandboxProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(initialCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col border border-white/10 rounded-xl overflow-hidden bg-black/40 backdrop-blur-sm group hover:border-cyan-500/30 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-3">
            <div className={cn(
                "w-2 h-2 rounded-full",
                type === "ui" ? "bg-cyan-500" : type === "layout" ? "bg-purple-500" : "bg-orange-500"
            )} />
            <span className="font-mono text-xs text-white/70 uppercase tracking-widest">{title}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("preview")}
            className={cn(
              "p-1.5 rounded-md transition-all",
              activeTab === "preview" ? "bg-white/10 text-cyan-400" : "text-white/40 hover:text-white"
            )}
            title="Preview"
          >
            <Monitor size={14} />
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={cn(
              "p-1.5 rounded-md transition-all",
              activeTab === "code" ? "bg-white/10 text-cyan-400" : "text-white/40 hover:text-white"
            )}
            title="Code"
          >
            <Code size={14} />
          </button>
          <div className="w-px h-3 bg-white/10 mx-1" />
           <button
            onClick={copyToClipboard}
            className={cn(
              "p-1.5 rounded-md transition-all",
              copied ? "text-green-400" : "text-white/40 hover:text-white"
            )}
            title="Copy Code"
          >
            <Copy size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="relative flex-1 min-h-[200px] flex items-center justify-center p-6 bg-grid-white/[0.02]">
        {activeTab === "preview" ? (
          <div 
            className="w-full flex items-center justify-center animate-in fade-in zoom-in duration-300"
            dangerouslySetInnerHTML={{ __html: initialCode }}
          />
        ) : (
          <div className="absolute inset-0 p-4 overflow-auto bg-[#0a0a0a] font-mono text-xs text-white/70">
            <pre className="whitespace-pre-wrap break-all">
                {initialCode}
            </pre>
          </div>
        )}
      </div>
      
       {/* Footer */}
       <div className="px-4 py-2 bg-white/5 border-t border-white/10">
            <p className="text-[10px] text-white/40 truncate">{description}</p>
       </div>
    </div>
  );
}
