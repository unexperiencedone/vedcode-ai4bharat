"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Code2,
  BrainCircuit,
  Terminal,
  Blocks,
  Zap,
  Bug,
  Eye,
  FileText,
  FastForward,
} from "lucide-react";

const totalSteps = 6;

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // State for all 6 questions
  const [q1Experience, setQ1Experience] = useState<string>("");
  const [q2Languages, setQ2Languages] = useState<string[]>([]);
  const [q3Domains, setQ3Domains] = useState<string[]>([]);
  const [q4LearningStyle, setQ4LearningStyle] = useState<string>("");
  const [q5Depth, setQ5Depth] = useState<string>("");
  const [q6Confidence, setQ6Confidence] = useState<number>(-1);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }


  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
    else submitProfile();
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const submitProfile = async () => {
    setLoading(true);
    const profileId = session?.user?.id;

    if (!profileId) {
      alert("No active session found. Please login again.");
      setLoading(false);
      return;
    }

    // Map Q1
    let skillLevel = "beginner";
    if (q1Experience === "projects") skillLevel = "intermediate";
    if (q1Experience === "professional") skillLevel = "advanced";

    // Base skill score (continuous metric)
    let skillScore = 0.2;
    if (skillLevel === "intermediate") skillScore = 0.55;
    if (skillLevel === "advanced") skillScore = 0.85;

    // Map Q4
    let learningStyle = "visual";
    if (q4LearningStyle === "code") learningStyle = "mixed";
    if (q4LearningStyle === "step") learningStyle = "textual";
    if (q4LearningStyle === "summary") learningStyle = "textual";


    // Map Q5
    let preferredDepth = "balanced";
    if (q5Depth === "walkthrough") preferredDepth = "walkthrough";
    if (q5Depth === "key_points") preferredDepth = "key_points";

    // Confidence mapping directly translated from Q6 (0.25 to 1.0)
    let confidenceScore = q6Confidence > 0 ? q6Confidence : 0.5;

    const payload = {
      profileId,
      skillLevel,
      skillScore,
      learningStyle,
      preferredDepth,
      preferredLanguages: q2Languages,
      interestDomains: q3Domains,
      confidenceScore,
      inferredFromOnboarding: true,
    };

    console.log("DEBUG: Submitting onboarding profile with payload:", payload);

    try {

      const res = await fetch("/api/learner/profile", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok || res.status === 409) {
        console.log("DEBUG: Onboarding successful, triggering session update...");
        // Force session update so middleware recognizes onboarding is complete
        const updatedSession = await update({ onboardingComplete: true });
        console.log("DEBUG: Session updated result:", updatedSession);
        
        // Brief delay to allow cookie to settle before middleware sees it
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        router.push("/dashboard");

      } else {


        const errorData = await res.json();
        console.error("Failed to create profile", errorData);
        alert("Something went wrong saving your profile.");
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  // Toggle helpers for multi-select
  const toggleLanguage = (lang: string) => {
    setQ2Languages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang],
    );
  };
  const toggleDomain = (domain: string) => {
    setQ3Domains((prev) =>
      prev.includes(domain)
        ? prev.filter((d) => d !== domain)
        : [...prev, domain],
    );
  };

  const isNextDisabled = () => {
    if (step === 1 && !q1Experience) return true;
    if (step === 2 && q2Languages.length === 0) return true;
    if (step === 3 && q3Domains.length === 0) return true;
    if (step === 4 && !q4LearningStyle) return true;
    if (step === 5 && !q5Depth) return true;
    if (step === 6 && q6Confidence === -1) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-6 selection:bg-indigo-500/30 font-sans">
      <div className="w-full max-w-2xl">
        {/* Progress header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-semibold tracking-wider text-neutral-400 mb-6 uppercase">
            <Zap className="w-3 h-3 text-amber-400" />
            Initializing VedCode Workspace
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Configure Your Learning Profile
          </h1>
          <p className="text-neutral-400 text-sm">
            We adapt documentation and roadmaps directly to your context.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-neutral-900 rounded-full mb-8 overflow-hidden">
          <motion.div
            className="h-full bg-indigo-500 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          />
        </div>

        {/* Form Container */}
        <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800/80 rounded-2xl p-8 min-h-[400px] flex flex-col relative shadow-2xl">
          <AnimatePresence mode="wait">
            {/* Step 1 */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1"
              >
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-indigo-400" /> How
                  comfortable are you with programming?
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    {
                      id: "starting",
                      label: "Just starting out",
                      desc: "Learning my first language",
                    },
                    {
                      id: "basics",
                      label: "Know the basics",
                      desc: "Understand loops, arrays, and functions",
                    },
                    {
                      id: "projects",
                      label: "Building projects",
                      desc: "Can assemble components into working apps",
                    },
                    {
                      id: "professional",
                      label: "Professional developer",
                      desc: "Write software for a living",
                    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setQ1Experience(opt.id)}
                      className={`text-left p-4 rounded-xl border transition-all ${q1Experience === opt.id ? "bg-indigo-500/10 border-indigo-500 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.1)]" : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800"}`}
                    >
                      <div className="font-medium text-white">{opt.label}</div>
                      <div className="text-xs text-neutral-500 mt-1">
                        {opt.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1"
              >
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-indigo-400" /> Which languages
                  do you mainly use?{" "}
                  <span className="text-xs font-normal text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded ml-2">
                    Select all that apply
                  </span>
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "JavaScript / TypeScript",
                    "Python",
                    "Java",
                    "C / C++",
                    "Go",
                    "Rust",
                    "Ruby",
                    "Other",
                  ].map((lang) => {
                    const id = lang.toLowerCase().replace(/ \/ | /g, "_");
                    const isSelected = q2Languages.includes(id);
                    return (
                      <button
                        key={id}
                        onClick={() => toggleLanguage(id)}
                        className={`text-left px-4 py-3 rounded-xl border flex items-center justify-between transition-all ${isSelected ? "bg-indigo-500/10 border-indigo-500 text-indigo-200" : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700"}`}
                      >
                        <span className="font-medium">{lang}</span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-indigo-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1"
              >
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Blocks className="w-5 h-5 text-indigo-400" /> What technical
                  areas are you most interested in?
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "web_dev", label: "Web Development" },
                    { id: "ai_ml", label: "AI / Machine Learning" },
                    { id: "backend", label: "Backend Systems" },
                    { id: "devops", label: "DevOps / Infra" },
                    { id: "data_eng", label: "Data Engineering" },
                    { id: "mobile", label: "Mobile App Dev" },
                  ].map((domain) => {
                    const isSelected = q3Domains.includes(domain.id);
                    return (
                      <button
                        key={domain.id}
                        onClick={() => toggleDomain(domain.id)}
                        className={`text-left px-4 py-3 rounded-xl border flex items-center justify-between transition-all ${isSelected ? "bg-indigo-500/10 border-indigo-500 text-indigo-200" : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700"}`}
                      >
                        <span className="font-medium">{domain.label}</span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-indigo-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1"
              >
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-indigo-400" /> How do you prefer
                  explanations?
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    {
                      id: "visual",
                      label: "Visual diagrams",
                      icon: <Eye className="w-4 h-4 text-neutral-400" />,
                    },
                    {
                      id: "code",
                      label: "Show me the code, minimal text",
                      icon: <Code2 className="w-4 h-4 text-neutral-400" />,
                    },
                    {
                      id: "step",
                      label: "Step-by-step written text",
                      icon: <FileText className="w-4 h-4 text-neutral-400" />,
                    },
                    {
                      id: "summary",
                      label: "Short technical summaries",
                      icon: (
                        <FastForward className="w-4 h-4 text-neutral-400" />
                      ),
                    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setQ4LearningStyle(opt.id)}
                      className={`text-left px-4 py-4 rounded-xl border flex items-center gap-4 transition-all ${q4LearningStyle === opt.id ? "bg-indigo-500/10 border-indigo-500 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.1)]" : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800"}`}
                    >
                      <div
                        className={`p-2 rounded-lg bg-neutral-800/50 ${q4LearningStyle === opt.id && "bg-indigo-500/20 text-indigo-400"}`}
                      >
                        {opt.icon}
                      </div>
                      <span className="font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 5 */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1"
              >
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-indigo-400" /> When
                  learning a new concept you prefer:
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    {
                      id: "walkthrough",
                      label: "A highly detailed walkthrough starting from zero",
                    },
                    {
                      id: "balanced",
                      label: "A balanced explanation with some context",
                    },
                    {
                      id: "key_points",
                      label: "Straight to the key technical points",
                    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setQ5Depth(opt.id)}
                      className={`text-left px-4 py-4 rounded-xl border transition-all ${q5Depth === opt.id ? "bg-indigo-500/10 border-indigo-500 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.1)]" : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800"}`}
                    >
                      <span className="font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 6 */}
            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1"
              >
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Bug className="w-5 h-5 text-indigo-400" /> How confident are
                  you debugging unfamiliar code?
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    {
                      val: 0.25,
                      label:
                        "Rarely - it usually takes me hours to figure out errors.",
                    },
                    {
                      val: 0.5,
                      label:
                        "Sometimes - I can usually trace the stack, but struggle with complex systems.",
                    },
                    {
                      val: 0.75,
                      label:
                        "Often - I know exactly which files to trace and where to set breakpoints.",
                    },
                    {
                      val: 1.0,
                      label:
                        "Always - I solve undocumented edge-cases routinely.",
                    },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => setQ6Confidence(opt.val)}
                      className={`text-left px-4 py-4 rounded-xl border transition-all ${q6Confidence === opt.val ? "bg-indigo-500/10 border-indigo-500 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.1)]" : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800"}`}
                    >
                      <span className="font-medium text-white block mb-1">
                        {opt.label.split(" - ")[0]}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {opt.label.split(" - ")[1]}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls Footer */}
          <div className="mt-8 flex items-center justify-between border-t border-neutral-800/50 pt-5">
            <button
              onClick={prevStep}
              disabled={step === 1 || loading}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${step === 1 ? "opacity-0 pointer-events-none" : "text-neutral-400 hover:text-white hover:bg-neutral-800"}`}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            <button
              onClick={nextStep}
              disabled={isNextDisabled() || loading}
              className="flex items-center gap-1.5 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-all"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : step === totalSteps ? (
                <>
                  Complete Setup <Check className="w-4 h-4" />
                </>
              ) : (
                <>
                  Continue <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
