"use client";

import { CommandHeader } from "@/components/layout/CommandHeader";
import { ClusterRail } from "@/components/layout/ClusterRail";
import { SystemFooter } from "@/components/layout/SystemFooter";
import { ChevronRight } from "lucide-react";

export default function ManifestoPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-background text-foreground font-sans">
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff12_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="px-8 py-4 flex items-center gap-2 text-[11px] font-medium tracking-wider uppercase text-muted-foreground/40 border-b border-white/10 z-10 bg-background/50 backdrop-blur-sm">
          <span>Cluster 5</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Infrastructure</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground">Manifesto</span>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-12 z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 tracking-tight">
            System Manifesto
          </h1>

          <div className="prose prose-invert prose-lg">
            <p className="lead text-xl text-muted-foreground">
              The Archive is not merely a portfolio; it is a recursive
              self-documentation system designed to evolve alongside its
              creator.
            </p>

            <h3>1. Code as Artifact</h3>
            <p>
              Every line of code is a creative decision. We treat our
              repositories not as dusty storage units, but as galleries of logic
              and architecture.
            </p>

            <h3>2. The Cluster Philosophy</h3>
            <p>
              Knowledge is too vast to be linear. By organizing work into
              Clusters (Collective, Intelligence, Identity, Learning,
              Infrastructure), we mirror the cognitive map of a full-stack
              developer.
            </p>

            <h3>3. Transparency by Default</h3>
            <p>
              The "Live Feed" and "Joint Ledger" are not simulations. They
              represent a commitment to open-source visibility (where
              applicable) and honest representation of activity.
            </p>

            <h3>4. Aesthetic Functionality</h3>
            <p>
              Brutalism meets elegance. The interface should never hide the
              machine; it should celebrate the underlying structure while
              providing a frictionless user experience.
            </p>

            <blockquote>
              "To document is to understand. To archive is to preserve context
              for the future self."
            </blockquote>
          </div>
        </div>
      </main>
    </div>
  );
}
