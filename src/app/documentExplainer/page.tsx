import React from "react";
import DocReadingMode from "@/components/documentExplainer/DocReadingMode";

export const metadata = {
  title: "Document Explainer | VedCode",
  description: "Next-gen way to read documentation.",
};

export default function DocumentExplainerPage() {
  return (
    <main className="flex-1 h-full flex flex-col overflow-hidden bg-slate-950">
      <DocReadingMode />
    </main>
  );
}
