import { Brain, Code, FileText, ChevronRight } from "lucide-react";

import ReactMarkdown from "react-markdown";

interface ExplanationCardProps {
  keyword: string;
  explanation: string | null;
}

export function ExplanationCard({ keyword, explanation }: ExplanationCardProps) {
  if (!keyword) return null;

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header / Memory Tracking Toggle */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          {keyword}
        </h2>
        <div className="flex flex-col items-end">
          <label className="flex items-center gap-2 cursor-pointer group">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground group-hover:text-primary transition-colors">
              Log to Memory
            </span>
            <div className="w-10 h-5 bg-border rounded-full relative transition-colors group-hover:bg-primary/30 origin-center scale-90">
              <div className="w-4 h-4 rounded-full bg-muted-foreground absolute top-0.5 left-0.5 transition-transform group-hover:translate-x-5 group-hover:bg-primary"></div>
            </div>
          </label>
          <span className="text-[10px] text-muted-foreground/60 mt-1">Ebbinghaus tracking initializing...</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Code First Context Column */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
            <div className="border-b border-border/50 bg-muted/30 px-4 py-3 flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-semibold text-foreground">Code-First Context (Your Project)</span>
            </div>
            
            <div className="p-4 bg-background/50 font-mono text-sm leading-relaxed overflow-x-auto border-b border-border/50 text-foreground/80">
              {explanation ? (
                <div className="prose prose-invert prose-sm max-w-none text-muted-foreground">
                   {/* Note: In a cleaner impl, we'd slice the markdown into Code and Theory parts. For raw output, we just render it here. */}
                   <ReactMarkdown>{explanation}</ReactMarkdown>
                </div>
              ) : (
                <>
                  <div className="text-muted-foreground text-xs mb-2">📄 src/lib/schema.ts: L42-51</div>
                  <pre>
                    <code className="text-blue-400">export const</code> <span className="text-yellow-300">UserSchema</span> = z.object({"{ \n"}
                    {"  "}email: z<span className="text-green-300">.string()</span><span className="text-green-300">.email()</span>,{"\n"}
                    {"  "}password: z<span className="text-green-300">.string()</span><span className="text-green-300">.min(</span>8<span className="text-green-300">)</span>,{"\n"}
                    {"  "}role: z<span className="text-green-300">.enum(</span>["USER", "ADMIN"]<span className="text-green-300">)</span>,{"\n"}
                    {"}"})<span className="text-green-300">.refine</span>((data) =&gt; ...);
                  </pre>
                </>
              )}
            </div>
            
            <div className="p-5 text-sm leading-relaxed text-muted-foreground">
              <span className="text-foreground font-medium">In your project:</span> You are using `{keyword}` within the UserSchema to rigidly define the shape of your authentication inputs before they ever touch Drizzle ORM. This acts as a protective layer preventing invalid emails or short passwords from causing database errors.
            </div>
          </div>

          <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
            <div className="border-b border-border/50 bg-muted/30 px-4 py-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-foreground">Theory-Second Explanation</span>
            </div>
            <div className="p-5 text-sm leading-relaxed text-muted-foreground">
              {keyword} is a schema declaration and data validation methodology. Rather than manually writing `if (typeof data !== 'string')` everywhere, you define a single schema that guarantees the exact types and formats. If data fails the schema, it throws an error immediately rather than propagating bad state through your application.
            </div>
          </div>
        </div>

        {/* Sidebar Mini Diagram / Flow */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm h-full">
            <div className="border-b border-border/50 bg-muted/30 px-4 py-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-semibold text-foreground">Mental Model</span>
            </div>
            <div className="p-5 flex flex-col gap-4">
              
              {/* Concept Diagram Placeholder via Tailwind */}
              <div className="flex flex-col items-center gap-2 py-4">
                <div className="w-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs text-center py-2 rounded-md font-mono">
                  Raw / Untrusted Data
                </div>
                <div className="h-4 border-l-2 border-dashed border-border"></div>
                
                <div className="w-full bg-primary/10 border border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] text-primary text-xs font-bold text-center py-3 rounded-md animate-pulse">
                  {keyword}
                </div>
                
                <div className="h-4 border-l-2 border-dashed border-border relative">
                  <div className="w-2 h-2 rounded-full bg-primary absolute -left-[5px] top-1"></div>
                </div>
                <div className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center py-2 rounded-md font-mono">
                  Strictly Typed Data
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
