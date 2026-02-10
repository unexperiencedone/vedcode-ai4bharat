"use client";

import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function UILibraryPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-background text-foreground font-sans">
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="px-8 py-4 flex items-center gap-2 text-[11px] font-medium tracking-wider uppercase text-muted-foreground/40 border-b border-white/10 z-10 bg-background/50 backdrop-blur-sm">
          <span>Cluster 5</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Infrastructure</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground">UI Library</span>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-12 z-10">
          <h1 className="text-3xl font-bold mb-8 tracking-tight">
            Component System
          </h1>

          <section className="mb-12">
            <h2 className="text-lg font-semibold text-muted-foreground mb-4">
              Buttons
            </h2>
            <div className="flex flex-wrap gap-4 p-6 border border-white/10 rounded-xl bg-white/[0.02]">
              <Button>Default Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-lg font-semibold text-muted-foreground mb-4">
              Inputs & Forms
            </h2>
            <div className="space-y-4 max-w-md p-6 border border-white/10 rounded-xl bg-white/[0.02]">
              <Input placeholder="Default Input" />
              <Input disabled placeholder="Disabled Input" />
              <Input type="password" placeholder="Password" />
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-lg font-semibold text-muted-foreground mb-4">
              Badges
            </h2>
            <div className="flex flex-wrap gap-4 p-6 border border-white/10 rounded-xl bg-white/[0.02]">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-lg font-semibold text-muted-foreground mb-4">
              Typography & Separators
            </h2>
            <div className="p-6 border border-white/10 rounded-xl bg-white/[0.02] space-y-4">
              <h3 className="text-2xl font-bold">Heading 3</h3>
              <p className="text-muted-foreground">
                This is a paragraph of text showing the muted color.
              </p>
              <Separator />
              <p className="text-sm font-light">Small font light variant.</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
