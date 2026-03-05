"use client";

import { useState, useEffect } from "react";
import EditorWindow from "@/components/compiler/EditorWindow";
import OutputTerminal from "@/components/compiler/OutputTerminal";
import ControlPanel from "@/components/compiler/ControlPanel";
import { detectLanguage } from "@/lib/languageDetector";

export default function CompilerPage() {
  const [language, setLanguage] = useState("auto");
  const [detectedLanguage, setDetectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customInput, setCustomInput] = useState("");

  // Auto Language Detection
  useEffect(() => {
    if (language === "auto") {
      const timer = setTimeout(() => {
        setDetectedLanguage(detectLanguage(code));
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setDetectedLanguage(language);
    }
  }, [code, language]);

  // Handle Run Code
  const runCode = async () => {
    setIsLoading(true);
    setOutput(null);
    try {
      const activeLang = language === "auto" ? detectedLanguage : language;
      const response = await fetch(`/api/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: activeLang,
          version: "*",
          code,
          stdin: customInput,
        }),
      });
      const data = await response.json();
      setOutput(data);
    } catch {
      setOutput({
        run: { stderr: "Failed to connect to the execution server.", code: 1 },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-3 p-4 bg-background">
      <ControlPanel
        language={language}
        setLanguage={setLanguage}
        detectedLanguage={detectedLanguage}
        runCode={runCode}
        isLoading={isLoading}
        code={code}
        setCode={setCode}
      />

      <div className="flex-1 grid grid-rows-2 lg:grid-rows-1 lg:grid-cols-2 gap-3 min-h-0">
        <EditorWindow
          language={language}
          activeLang={language === "auto" ? detectedLanguage : language}
          code={code}
          setCode={setCode}
          runCode={runCode}
        />
        <OutputTerminal
          output={output}
          isLoading={isLoading}
          customInput={customInput}
          setCustomInput={setCustomInput}
        />
      </div>
    </div>
  );
}
