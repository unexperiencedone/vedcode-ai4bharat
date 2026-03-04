"use client";

import { useEffect, useRef } from "react";

interface MermaidDiagramProps {
  code: string;
}

export default function MermaidDiagram({ code }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!code || !containerRef.current) return;

    let cancelled = false;

    const render = async () => {
      try {
        const { default: mermaid } = await import("mermaid");

        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
          mindmap: { padding: 16 } as any,
        });

        // Use a unique ID every time to avoid mermaid SVG ID cache collisions
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(id, code);

        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;

          // Make the SVG responsive
          const svgEl = containerRef.current.querySelector("svg");
          if (svgEl) {
            svgEl.removeAttribute("height");
            svgEl.style.width = "100%";
            svgEl.style.maxWidth = "100%";
          }
        }
      } catch (err: any) {
        console.error("Mermaid render error:", err);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = `
            <div style="color:#f87171;padding:12px;font-size:12px">
              ⚠ Could not render diagram. Raw source shown below.
            </div>
            <pre style="color:#94a3b8;font-size:11px;white-space:pre-wrap;padding:12px">${code}</pre>
          `;
        }
      }
    };

    render();

    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <div
      ref={containerRef}
      className="flex justify-center items-center min-h-48 p-4 rounded-lg bg-slate-950 border border-slate-800 overflow-auto"
    />
  );
}
