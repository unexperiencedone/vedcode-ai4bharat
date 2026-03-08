import React from "react";
import { KnowledgeMap } from "@/components/knowledge/KnowledgeMap";

export default function KnowledgeMapPage() {
  return (
    <div className="flex-1 flex flex-col relative w-full h-full">
      {/* Header Overlay */}
      <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-2xl">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Global Knowledge Graph
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Explore concepts, prerequisites, and relationships across
          technologies.
        </p>
        <div className="flex items-center gap-4 mt-3 text-xs">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>{" "}
            Prerequisite
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div> Related
          </span>
        </div>
      </div>

      {/* The Full Canvas */}
      <KnowledgeMap />
    </div>
  );
}
