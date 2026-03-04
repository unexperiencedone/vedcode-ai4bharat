import React from "react";
import DocReadingMode from "@/components/documentExplainer/DocReadingMode";

export const metadata = {
  title: "Document Explainer | Ved Code",
  description: "Next-gen way to read documentation.",
};

export default function DocumentExplainerPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <DocReadingMode />
    </main>
  );
}
