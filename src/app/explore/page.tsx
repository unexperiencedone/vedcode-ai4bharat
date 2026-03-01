"use client";

import { GraphCanvas } from "@/components/galaxy/GraphCanvas";

export default function ExplorePage() {
  return (
    <div className="flex flex-col h-full w-full p-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            Project Constellation
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            A visual representation of the AST generated from your project. The luminosity of files denotes their complexity, and gravitational force maps to their dependencies.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="border border-border/50 bg-card rounded-lg p-1.5 flex text-xs">
            <button className="px-3 py-1.5 bg-primary/20 text-primary rounded-md font-medium">Radial-Force</button>
            <button className="px-3 py-1.5 text-muted-foreground hover:text-foreground">Hierarchical</button>
          </div>
        </div>
      </div>
      
      {/* Constellation Container */}
      <div className="flex-1 w-full relative group">
        <GraphCanvas />
      </div>
    </div>
  );
}
