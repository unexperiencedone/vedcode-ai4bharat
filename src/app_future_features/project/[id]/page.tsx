"use client";

import * as React from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Lock,
  Code,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LogicFlow } from "@/components/projects/LogicFlow";

export default function ProjectDetailPage() {
  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Background Decor */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-12">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Joint Works</span>
        </Link>

        {/* Hero Section */}
        <header className="mb-16 md:mb-24">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 text-primary text-sm font-medium uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Case Study 042
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight text-foreground max-w-4xl">
              Project Alpha:{" "}
              <span className="text-muted-foreground">
                Distributed Systems Scaling
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Re-architecting the core data pipeline to handle 10x throughput
              with sub-millisecond latency. A study in minimalist efficiency.
            </p>

            {/* Meta Bar */}
            <div className="mt-8 flex flex-wrap gap-4 items-center border-t border-border/10 pt-8">
              {/* Contributor Badges */}
              <div className="flex items-center -space-x-2 mr-6">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9UxHlo5LnmzFRstoDHM83M-J7BaKkLKLA6GIl8o7DngQBO54e2Dg5vOQ1oZQZSZ7P9ufgN6OpplwreCy1od40K1_64rLBIfn9zs7lLpWoJ_3QfXGv4QAmPXBaEmW0hWJtL-pHiIDKFJl2YLV74J2WEoA6j6NNOPlTYueHhDJa9Vcd4fAw8WRI9ebxQQY71O5VDw77eIZIMkXQrQZl5nxXCHrzOFxCMyc2RPseGDFv0Gz5iG0sT9kxbN70zHD7rAclI0tIBjO9VFCR"
                  className="w-10 h-10 rounded-full border-2 border-background object-cover"
                  alt="Avatar"
                />
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlTGCdsD_1tJJjuZbjtwZUyhc11gSZBbBxr7Uq9KR-AxBrYRxw_44sBdvGbXS-iTXW_Xzzcw-wOazTs9UQFxCXbsd4BvgEfX2amkwEw4j2Bd004RhIRJpQJkhdX_UjwuL8cnjfdVeAhxk8TgCwgoyKM2K6qqy2PfV85xBGtXsoMRETdT0ohhtxRsnRR3ynuV6Ykif_uxO9xpQrS_iBzmcHC5b5t17oCSQ88YWhkuMwb-MB4b-ffCWempKxO1I5KcDegjMNY5SNqZlb"
                  className="w-10 h-10 rounded-full border-2 border-background object-cover"
                  alt="Avatar"
                />
                <div className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs text-muted-foreground font-mono">
                  +3
                </div>
              </div>

              <div className="flex gap-2">
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 uppercase tracking-widest gap-1 py-1"
                >
                  System Arch
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 uppercase tracking-widest gap-1 py-1"
                >
                  Backend
                </Badge>
              </div>

              <div className="h-8 w-px bg-border/20 mx-2 hidden sm:block"></div>
              <div className="flex gap-2 text-sm text-muted-foreground font-mono items-center">
                <span>Rust</span>
                <span className="text-border/40">•</span>
                <span>gRPC</span>
                <span className="text-border/40">•</span>
                <span>Kafka</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column (Narrative) */}
          <div className="lg:col-span-8 space-y-16">
            {/* Hero Image */}
            {/* Logic Flow Visualizer */}
            <LogicFlow
              modules={[
                {
                  id: "client",
                  label: "Client UI",
                  type: "client",
                  description:
                    "React/Next.js frontend with real-time WebSocket hooks.",
                  technologies: ["Next.js", "Tailwind", "Framer Motion"],
                },
                {
                  id: "events",
                  label: "Event Layer",
                  type: "server",
                  description:
                    "High-throughput WebSocket server handling 10k+ concurrent connections.",
                  technologies: ["Node.js", "ws", "Redis"],
                },
                {
                  id: "core",
                  label: "Ledger Core",
                  type: "database",
                  description: "Immutable append-only ledger on PostgreSQL.",
                  technologies: ["PostgreSQL", "Drizzle", "Rust"],
                },
              ]}
              relationships={[
                { from: "client", to: "events", label: "Subscribes" },
                { from: "events", to: "core", label: "Persists" },
              ]}
              narrative={{
                architecture:
                  "The system uses a pessimistic locking mechanism on the Postgres core to ensure ledger integrity, while the Event Layer broadcasts confirm updates to subscribed clients in < 50ms.",
                human:
                  "Architecture by [You], UI Components by [Friend]. We spent 3 weeks optimizing the rust-to-postgres bridge.",
                proof: [
                  { label: "Schema Definition", url: "/vault/schema-def" },
                  { label: "Socket Handler", url: "/vault/socket-handler" },
                ],
              }}
            />

            {/* Challenge Section */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                <span className="text-primary font-mono text-lg">01.</span> The
                Challenge
              </h2>
              <div className="prose prose-invert prose-lg max-w-none text-muted-foreground">
                <p className="mb-6">
                  The legacy infrastructure was buckling under the weight of
                  real-time data ingestion. Latency spikes during peak hours
                  were exceeding 500ms, creating unacceptable delays for
                  downstream consumers. Our task was to decouple the ingestion
                  layer and introduce a highly concurrent processing engine.
                </p>
                <blockquote className="border-l-4 border-primary pl-6 py-2 my-8 italic text-xl text-foreground font-light bg-primary/5 rounded-r">
                  "Efficiency isn't just about speed; it's about predictability
                  under load. We needed a system that breathed rather than
                  choked."
                </blockquote>
                <p>
                  We identified three critical bottlenecks: synchronous database
                  writes, single-threaded processing workers, and an unoptimized
                  JSON serialization format. The goal was simple but ambitious:{" "}
                  <span className="text-foreground font-semibold">
                    Zero-downtime migration to a stream-based architecture.
                  </span>
                </p>
              </div>
            </section>

            {/* Code Snippet */}
            <section className="bg-[#101722] rounded-lg border border-border/10 overflow-hidden font-mono text-sm relative group shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/10 bg-[#151e2e]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                </div>
                <span className="text-muted-foreground text-xs">
                  processor.rs
                </span>
              </div>
              <div className="p-6 overflow-x-auto text-blue-100">
                <pre>
                  <code>
                    <span className="text-primary">async fn</span>{" "}
                    <span className="text-yellow-400">process_stream</span>(
                    <span className="text-purple-400">mut</span> stream:{" "}
                    <span className="text-blue-400">KafkaStream</span>, config:{" "}
                    <span className="text-blue-400">Arc</span>&lt;
                    <span className="text-blue-400">Config</span>&gt; ) -&gt;{" "}
                    <span className="text-blue-400">Result</span>&lt;(),{" "}
                    <span className="text-blue-400">Error</span>&gt; &#123;
                    <span className="text-slate-500">
                      // Parallel processing with backpressure handling
                    </span>
                    stream.for_each_concurrent(
                    <span className="text-purple-400">None</span>, |msg|{" "}
                    <span className="text-primary">async move</span> &#123;
                    <span className="text-primary">let</span> payload =
                    msg.payload();
                    <span className="text-primary">match</span>{" "}
                    <span className="text-yellow-400">decode_proto</span>
                    (payload) &#123;
                    <span className="text-blue-400">Ok</span>(event) =&gt;
                    &#123;
                    <span className="text-primary">if let</span>{" "}
                    <span className="text-blue-400">Err</span>(e) = sink.
                    <span className="text-yellow-400">send</span>(event).
                    <span className="text-primary">await</span> &#123; metrics.
                    <span className="text-yellow-400">increment</span>(
                    <span className="text-green-400">"drop_count"</span>);
                    &#125; &#125;
                    <span className="text-blue-400">Err</span>(_) =&gt; log::
                    <span className="text-yellow-400">warn!</span>(
                    <span className="text-green-400">
                      "Malformed payload detected"
                    </span>
                    ), &#125; &#125;).
                    <span className="text-primary">await</span>;
                    <span className="text-blue-400">Ok</span>(()) &#125;
                  </code>
                </pre>
              </div>
            </section>

            {/* Solution Section */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                <span className="text-primary font-mono text-lg">02.</span> The
                Solution
              </h2>
              <div className="prose prose-invert prose-lg max-w-none text-muted-foreground">
                <p className="mb-6">
                  By shifting to Rust for the core processing workers, we
                  eliminated the Garbage Collection pauses that were causing
                  tail latency spikes. We implemented a custom binary protocol
                  over gRPC, reducing payload size by 65% compared to the
                  previous JSON implementation.
                </p>
                <p>
                  The architecture now relies on an event-driven model.
                  Producers push to a durable log, and consumers pull at their
                  own pace, allowing for elastic scaling of worker nodes based
                  on lag metrics.
                </p>
              </div>
            </section>

            {/* Gallery Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative aspect-square rounded-lg overflow-hidden border border-border/10 group">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMsXxmgEpmTG52_mSCfPsOOokUttSJgb5OTkdQj3uZgPN6vays_ay9k6e-4nczPiCFhoAXPKqvFx7Hxmh3c3cfufHSv7hw9ay9Q-qly9IX7n-5_AN5jHJPoe_C7qIg4ulA47llhMDwYIEAvSeQG97rptAJfH1AtVM0mpriY5tTdyusEyKgDmst89fn8hrxBwd6yWXynyxSkOBpbYT064LW_QXJSOsIjHAMet_qlhzDXqiNlJ8W5p5XAPrcQeyPffMSmoSxt9uf3HTJ"
                  alt="Dash"
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-foreground text-sm font-medium">
                    Real-time Dashboard
                  </span>
                </div>
              </div>
              <div className="relative aspect-square rounded-lg overflow-hidden border border-border/10 group">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMGGAIc-uXxj66P1XxodPVDffGTBvzMVG9d_W3gmrR2ag_Ag6mn59wu-BLDDyVSMyXyMICey-896S7TGvMrO_AyT7qWFwNn_GeTEr-gbeCL4hO9sXN2XJy7SPnyZO2vVCXdMA-1K9AH8cx4slfHN0m7fNALvBxqg87RznYqimDSers8X2C2iIr7NLPr9w3LkLxkMetMg9Q-SunTOwEyL6HzaVhI6i9yJYX1EYpXYT2gDO-N0xDfvwsyS6YwwsgnCPSPdhs6RqFI7tQ"
                  alt="Nodes"
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-foreground text-sm font-medium">
                    Infrastructure Nodes
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column (Metrics & Info) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-24 space-y-8">
              {/* Metrics Card */}
              <div className="bg-card rounded-xl p-6 border border-border/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <ArrowUpRight className="w-32 h-32 text-primary" />
                </div>
                <h3 className="text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-6">
                  Performance Delta
                </h3>
                <div className="space-y-6">
                  <MetricBar
                    label="Throughput"
                    value="+450%"
                    color="bg-primary"
                    width="90%"
                  />
                  <MetricBar
                    label="Latency (p99)"
                    value="-85%"
                    color="bg-emerald-500"
                    width="15%"
                  />
                  <MetricBar
                    label="Server Cost"
                    value="-30%"
                    color="bg-emerald-500"
                    width="70%"
                  />
                </div>
                <div className="mt-8 pt-6 border-t border-border/10 grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-3xl font-bold text-foreground">
                      99.99%
                    </span>
                    <span className="text-xs text-muted-foreground uppercase">
                      Uptime
                    </span>
                  </div>
                  <div>
                    <span className="block text-3xl font-bold text-foreground">
                      12ms
                    </span>
                    <span className="text-xs text-muted-foreground uppercase">
                      Avg Response
                    </span>
                  </div>
                </div>
              </div>

              {/* Project Data */}
              <div className="border border-border/10 rounded-xl p-6">
                <h3 className="text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-4">
                  Project Data
                </h3>
                <ul className="space-y-4">
                  <DataItem label="Client" value="FinTech Global" />
                  <DataItem label="Timeline" value="12 Weeks" />
                  <li className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="text-emerald-500 font-medium flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Live
                    </span>
                  </li>
                  <li className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Repository</span>
                    <a
                      href="#"
                      className="text-primary hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      Private <Lock className="w-3 h-3" />
                    </a>
                  </li>
                </ul>
              </div>

              {/* CTA */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
                <h3 className="text-foreground font-semibold mb-2">
                  Interested in this stack?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We've open-sourced the core protocol library used in this
                  project.
                </p>
                <Button className="w-full shadow-lg shadow-primary/20">
                  View on GitHub
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricBarProps {
  label: string;
  value: string;
  color: string;
  width: string;
}

function MetricBar({ label, value, color, width }: MetricBarProps) {
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <span className="text-muted-foreground text-sm">{label}</span>
        <span
          className={cn(
            "font-bold text-xl",
            color.includes("emerald") ? "text-emerald-500" : "text-primary",
          )}
        >
          {value}
        </span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full", color)} style={{ width }} />
      </div>
    </div>
  );
}

interface DataItemProps {
  label: string;
  value: string;
}

function DataItem({ label, value }: DataItemProps) {
  return (
    <li className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </li>
  );
}
