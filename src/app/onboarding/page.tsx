"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UploadButton } from "@/lib/uploadthing";

const INTEREST_OPTIONS = [
  { name: "Photography", icon: "photo_camera" },
  { name: "3D Renders", icon: "view_in_ar" },
  { name: "Music", icon: "music_note" },
  { name: "Coding", icon: "code" },
  { name: "Gaming", icon: "sports_esports" },
  { name: "Podcasting", icon: "podcasts" },
  { name: "Travel", icon: "travel_explore" },
  { name: "Cooking", icon: "cooking" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, update } = useSession();

  // Step 1 fields
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState("");

  // Step 2 fields
  const [contactEmail, setContactEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [codingPhilosophy, setCodingPhilosophy] = useState("Functional");

  // Step 3 fields
  const [interests, setInterests] = useState<string[]>([]);
  const [hobbies, setHobbies] = useState("");

  // Step 4 fields
  const [primaryOs, setPrimaryOs] = useState("Linux");
  const [preferredIde, setPreferredIde] = useState("VS Code");
  const [hardwareSetup, setHardwareSetup] = useState("");
  const [themePreference, setThemePreference] = useState("Midnight");

  const toggleInterest = (name: string) => {
    setInterests((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name],
    );
  };

  const handleFinalize = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          handle,
          bio,
          image,
          linkedin,
          github,
          codingPhilosophy,
          interests,
          hobbies: hobbies ? [hobbies] : [],
          primaryOs,
          preferredIde,
          hardwareSetup,
          themePreference,
        }),
      });
      if (res.ok) {
        // Force session update so middleware sees onboardingComplete = true
        await update({
          onboardingComplete: true,
          handle: handle,
        });
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Onboarding error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      <div
        className="min-h-screen flex flex-col text-[#F5F5F7] selection:bg-primary selection:text-white"
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          background: "radial-gradient(circle at top right, #1a2238, #101422)",
        }}
      >
        {/* Fixed background pattern */}
        <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(#ffffff10 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Navigation Bar */}
        <nav
          className="w-full border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-50"
          style={{
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(24px)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">
                account_balance_wallet
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#F5F5F7]">
              The Archive
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <span className="text-sm font-medium text-[#F5F5F7]/60">
              Documentation
            </span>
            <span className="text-sm font-medium text-[#F5F5F7]/60">
              Support
            </span>
            <div className="h-4 w-px bg-white/10" />
            <span className="text-sm font-medium text-[#F5F5F7]/80">
              Step {step} of 5
            </span>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
          {/* Ambient light */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

          {/* Glassmorphic Card */}
          <div
            className="w-full max-w-2xl rounded-xl shadow-2xl relative overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.03)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {/* Progress Header */}
            <div className="px-8 pt-8 pb-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-primary">
                  Onboarding
                </span>
                <span className="text-xs font-medium text-[#F5F5F7]/40 italic">
                  Step {step} of 5
                </span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{
                    width: `${step * 20}%`,
                    boxShadow: "0 0 10px rgba(13,70,242,0.5)",
                  }}
                />
              </div>
            </div>

            <div className="px-8 py-6">
              {/* ===== STEP 1: Establish Your Identity ===== */}
              {step === 1 && (
                <>
                  <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold tracking-tight text-[#F5F5F7] mb-3">
                      Establish Your Identity
                    </h1>
                    <p className="text-[#F5F5F7]/60 text-lg max-w-md mx-auto">
                      Welcome to The Archive. Your profile is the key to your
                      collection.
                    </p>
                  </div>
                  <form
                    className="space-y-6"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setStep(2);
                    }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Full Name */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-[#F5F5F7]/80 ml-1">
                          Full Name
                        </label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#F5F5F7]/30 text-xl">
                            person
                          </span>
                          <input
                            className="w-full pl-12 pr-4 py-4 rounded-lg text-[#F5F5F7] placeholder:text-[#F5F5F7]/20 focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_rgba(13,70,242,0.2)] transition-all"
                            style={{
                              background: "rgba(0,0,0,0.2)",
                              border: "1px solid rgba(255,255,255,0.1)",
                            }}
                            placeholder="Alexander Sterling"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      {/* Username */}
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-[#F5F5F7]/80 ml-1">
                          Username
                        </label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#F5F5F7]/30 text-xl">
                            alternate_email
                          </span>
                          <input
                            className="w-full pl-12 pr-4 py-4 rounded-lg text-[#F5F5F7] placeholder:text-[#F5F5F7]/20 focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_rgba(13,70,242,0.2)] transition-all"
                            style={{
                              background: "rgba(0,0,0,0.2)",
                              border: "1px solid rgba(255,255,255,0.1)",
                            }}
                            placeholder="asterling"
                            type="text"
                            value={handle}
                            onChange={(e) => setHandle(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-end ml-1">
                        <label className="text-sm font-semibold text-[#F5F5F7]/80">
                          Bio
                        </label>
                        <span className="text-[10px] text-[#F5F5F7]/30 uppercase tracking-widest font-bold">
                          {bio.length} / 160
                        </span>
                      </div>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-4 text-[#F5F5F7]/30 text-xl">
                          description
                        </span>
                        <textarea
                          className="w-full pl-12 pr-4 py-4 rounded-lg text-[#F5F5F7] placeholder:text-[#F5F5F7]/20 focus:outline-none focus:border-primary focus:shadow-[0_0_0_2px_rgba(13,70,242,0.2)] resize-none transition-all"
                          style={{
                            background: "rgba(0,0,0,0.2)",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                          placeholder="A brief description of your curation style..."
                          rows={4}
                          maxLength={160}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div className="p-6 border-2 border-dashed border-white/5 rounded-lg flex items-center gap-4 bg-white/[0.02] hover:bg-white/[0.04] transition-all group">
                      {image ? (
                        <div className="flex items-center gap-4 w-full">
                          <img
                            src={image}
                            alt="Profile"
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-sm font-bold text-[#F5F5F7]/80">
                              Image uploaded
                            </p>
                            <button
                              type="button"
                              onClick={() => setImage("")}
                              className="text-xs text-red-400 hover:text-red-300"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <UploadButton
                          endpoint="profileImage"
                          onClientUploadComplete={(res) => {
                            if (res?.[0]) setImage(res[0].url);
                          }}
                          onUploadError={(error: Error) => {
                            console.error("Upload error:", error);
                          }}
                          appearance={{
                            button:
                              "bg-white/5 border border-white/10 text-[#F5F5F7]/80 hover:bg-white/10 text-sm font-bold py-3 px-6 rounded-lg transition-all",
                            allowedContent: "text-[#F5F5F7]/40 text-xs",
                          }}
                        />
                      )}
                    </div>

                    {/* Action */}
                    <div className="pt-6 flex">
                      <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
                      >
                        <span>Continue to Step 2</span>
                        <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                          arrow_forward
                        </span>
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* ===== STEP 2: Professional Identity ===== */}
              {step === 2 && (
                <>
                  <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight mb-2">
                      Professional Identity
                    </h1>
                    <p className="text-[#F5F5F7]/50 text-lg">
                      Connect your profiles and define your craft.
                    </p>
                  </div>

                  <div className="space-y-8">
                    {/* Contact & Socials */}
                    <section className="flex flex-col gap-6">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-sm">
                          link
                        </span>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#F5F5F7]/40">
                          Social & Contact
                        </h3>
                      </div>
                      <div className="space-y-4">
                        {/* Contact Email */}
                        <div className="group">
                          <label className="block text-sm font-medium text-[#F5F5F7]/50 mb-1.5 ml-1">
                            Contact Email{" "}
                            <span className="text-primary">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#F5F5F7]/40 text-xl">
                              mail
                            </span>
                            <input
                              className="w-full bg-[#0f1117] border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-3.5 pl-12 pr-4 transition-all outline-none text-[#F5F5F7] placeholder:text-[#F5F5F7]/20"
                              placeholder="developer@example.com"
                              type="email"
                              required
                              value={contactEmail}
                              onChange={(e) => setContactEmail(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* LinkedIn */}
                          <div className="group">
                            <label className="block text-sm font-medium text-[#F5F5F7]/50 mb-1.5 ml-1">
                              LinkedIn URL{" "}
                              <span className="text-primary">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#F5F5F7]/40 text-xl">
                                share
                              </span>
                              <input
                                className="w-full bg-[#0f1117] border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-3.5 pl-12 pr-4 transition-all outline-none text-[#F5F5F7] placeholder:text-[#F5F5F7]/20"
                                placeholder="linkedin.com/in/username"
                                type="text"
                                required
                                value={linkedin}
                                onChange={(e) => setLinkedin(e.target.value)}
                              />
                            </div>
                          </div>
                          {/* GitHub */}
                          <div className="group">
                            <label className="block text-sm font-medium text-[#F5F5F7]/50 mb-1.5 ml-1">
                              GitHub Handle{" "}
                              <span className="text-primary">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#F5F5F7]/40 text-xl">
                                code
                              </span>
                              <input
                                className="w-full bg-[#0f1117] border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary rounded-lg py-3.5 pl-12 pr-4 transition-all outline-none text-[#F5F5F7] placeholder:text-[#F5F5F7]/20"
                                placeholder="@username"
                                type="text"
                                required
                                value={github}
                                onChange={(e) => setGithub(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Coding Philosophy */}
                    <section className="flex flex-col gap-6">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-sm">
                          psychology
                        </span>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#F5F5F7]/40">
                          Coding Philosophy
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          {
                            value: "Functional",
                            icon: "functions",
                            desc: "Pure functions, immutability, and declarative code.",
                          },
                          {
                            value: "Object-Oriented",
                            icon: "category",
                            desc: "Encapsulation, inheritance, and structured entities.",
                          },
                          {
                            value: "Minimalist",
                            icon: "remove",
                            desc: "KISS principle, low abstractions, and raw speed.",
                          },
                        ].map((opt) => (
                          <label
                            key={opt.value}
                            className="relative cursor-pointer group"
                          >
                            <input
                              type="radio"
                              name="coding_style"
                              className="sr-only peer"
                              checked={codingPhilosophy === opt.value}
                              onChange={() => setCodingPhilosophy(opt.value)}
                            />
                            <div className="h-full p-4 border border-white/10 rounded-lg bg-[#0f1117] peer-checked:border-primary peer-checked:bg-primary/5 transition-all hover:bg-white/5">
                              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-lg">
                                  {opt.icon}
                                </span>
                              </div>
                              <div className="font-bold text-sm mb-1">
                                {opt.value}
                              </div>
                              <p className="text-xs text-[#F5F5F7]/50">
                                {opt.desc}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </section>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex items-center gap-2 px-6 py-3 font-semibold text-[#F5F5F7]/50 hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">
                        arrow_back
                      </span>
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-3.5 rounded-lg font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                    >
                      Continue
                      <span className="material-symbols-outlined text-sm">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </>
              )}

              {/* ===== STEP 3: The Creative Wing ===== */}
              {step === 3 && (
                <>
                  <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold tracking-tight mb-3">
                      The Creative Wing
                    </h1>
                    <p className="text-[#F5F5F7]/60 text-lg">
                      Tell us what sparks your curiosity and fills your creative
                      hours.
                    </p>
                  </div>

                  <div className="space-y-8">
                    {/* Interests Grid */}
                    <div>
                      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-xl">
                          palette
                        </span>
                        Select your interests
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {INTEREST_OPTIONS.map((item) => (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => toggleInterest(item.name)}
                            className={`flex flex-col items-center justify-center gap-3 p-5 rounded-xl group transition-all ${
                              interests.includes(item.name)
                                ? "bg-primary/15 border-primary shadow-[0_0_20px_rgba(13,70,242,0.2)]"
                                : "bg-white/5 border-white/[0.08] hover:bg-white/10 hover:border-primary/50"
                            }`}
                            style={{
                              backdropFilter: "blur(8px)",
                              border: interests.includes(item.name)
                                ? "1px solid #0d46f2"
                                : "1px solid rgba(255,255,255,0.08)",
                            }}
                          >
                            <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">
                              {item.icon}
                            </span>
                            <span className="text-sm font-medium">
                              {item.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Open Ended */}
                    <div>
                      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-xl">
                          self_improvement
                        </span>
                        What else fills your free time?
                      </h2>
                      <textarea
                        className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none outline-none"
                        placeholder="Describe your hobbies or other unique skills..."
                        value={hobbies}
                        onChange={(e) => setHobbies(e.target.value)}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="w-full sm:w-auto px-8 py-3 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-lg">
                          arrow_back
                        </span>
                        Previous Step
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(4)}
                        className="w-full sm:w-auto px-12 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                      >
                        Continue
                        <span className="material-symbols-outlined text-lg">
                          arrow_forward
                        </span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ===== STEP 4: System Configuration ===== */}
              {step === 4 && (
                <>
                  <div className="border-l-2 border-primary pl-6 py-2 mb-8">
                    <h1 className="text-3xl font-bold tracking-tight mb-1">
                      System Configuration
                    </h1>
                    <p className="text-[#F5F5F7]/40 text-sm font-mono uppercase tracking-tighter">
                      Configure development environment and hardware parameters.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* OS */}
                    <div className="space-y-4">
                      <label className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#F5F5F7]/40 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                        01. Primary Operating System
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: "Linux", icon: "terminal" },
                          { value: "macOS", icon: "laptop_mac" },
                          { value: "Windows", icon: "window" },
                        ].map((opt) => (
                          <label
                            key={opt.value}
                            className="relative group cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="os"
                              className="sr-only peer"
                              checked={primaryOs === opt.value}
                              onChange={() => setPrimaryOs(opt.value)}
                            />
                            <div className="flex flex-col items-center justify-center p-4 border border-white/10 rounded-lg transition-all hover:border-primary/50 bg-white/5 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:shadow-[0_0_12px_rgba(13,70,242,0.15)]">
                              <span className="material-symbols-outlined text-2xl mb-2">
                                {opt.icon}
                              </span>
                              <span className="font-mono text-[10px] uppercase">
                                {opt.value}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* IDE */}
                    <div className="space-y-4">
                      <label className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#F5F5F7]/40 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                        02. Preferred IDE
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: "VS Code", icon: "code" },
                          { value: "JetBrains", icon: "rocket_launch" },
                          { value: "Neovim", icon: "keyboard" },
                        ].map((opt) => (
                          <label
                            key={opt.value}
                            className="relative group cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="ide"
                              className="sr-only peer"
                              checked={preferredIde === opt.value}
                              onChange={() => setPreferredIde(opt.value)}
                            />
                            <div className="flex flex-col items-center justify-center p-4 border border-white/10 rounded-lg transition-all hover:border-primary/50 bg-white/5 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:shadow-[0_0_12px_rgba(13,70,242,0.15)]">
                              <span className="material-symbols-outlined text-2xl mb-2">
                                {opt.icon}
                              </span>
                              <span className="font-mono text-[10px] uppercase">
                                {opt.value}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Hardware Setup */}
                    <div className="md:col-span-2 space-y-4">
                      <label className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#F5F5F7]/40 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                        03. Hardware Setup
                      </label>
                      <div className="relative group">
                        <div className="absolute top-3 left-4 pointer-events-none">
                          <span className="font-mono text-[10px] text-primary/40 leading-none">
                            ROOT@ARCHIVE:~$
                          </span>
                        </div>
                        <textarea
                          className="w-full h-32 bg-[#0f1117] border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-lg p-4 pt-8 text-sm font-mono text-emerald-500/90 resize-none transition-all placeholder:text-[#F5F5F7]/20 outline-none"
                          placeholder="Describe workstation specs, monitors, and peripherals..."
                          value={hardwareSetup}
                          onChange={(e) => setHardwareSetup(e.target.value)}
                        />
                        <div className="absolute bottom-3 right-4">
                          <span className="material-symbols-outlined text-white/20 text-sm">
                            developer_board
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Theme Preference */}
                    <div className="md:col-span-2 space-y-4">
                      <label className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#F5F5F7]/40 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                        04. Interface Aesthetics
                      </label>
                      <div className="flex flex-wrap gap-4">
                        {[
                          {
                            value: "Midnight",
                            color: "bg-[#080a12]",
                            border: "border-slate-700",
                            desc: "Deep slate tones",
                          },
                          {
                            value: "Bone",
                            color: "bg-[#f8fafc]",
                            border: "border-slate-300",
                            desc: "Muted off-white",
                          },
                          {
                            value: "Contrast",
                            color: "bg-primary",
                            border: "border-white",
                            desc: "Pure black & cobalt",
                          },
                        ].map((opt) => (
                          <label
                            key={opt.value}
                            className="flex-1 min-w-[140px] cursor-pointer group"
                          >
                            <input
                              type="radio"
                              name="theme"
                              className="sr-only peer"
                              checked={themePreference === opt.value}
                              onChange={() => setThemePreference(opt.value)}
                            />
                            <div className="flex items-center gap-3 p-4 border border-white/10 rounded-lg transition-all bg-white/5 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:shadow-[0_0_12px_rgba(13,70,242,0.15)]">
                              <div
                                className={`w-4 h-4 rounded-full ${opt.color} ${opt.border} border`}
                              />
                              <div className="flex flex-col">
                                <span className="font-mono text-xs font-bold uppercase">
                                  {opt.value}
                                </span>
                                <span className="text-[10px] text-[#F5F5F7]/40">
                                  {opt.desc}
                                </span>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-6 py-2 rounded font-mono text-xs uppercase tracking-widest text-[#F5F5F7]/40 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">
                        arrow_back
                      </span>
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(5)}
                      className="bg-primary text-white px-8 py-3 rounded font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-3 shadow-lg shadow-primary/20"
                    >
                      Next Step
                      <span className="material-symbols-outlined text-sm">
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </>
              )}

              {/* ===== STEP 5: Network Synchronization (Review) ===== */}
              {step === 5 && (
                <>
                  <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold tracking-tight mb-3">
                      Network Synchronization
                    </h1>
                    <p className="text-[#F5F5F7]/60 text-lg max-w-xl mx-auto">
                      Validate your neural signature and finalize your inclusion
                      into the immutable ledger.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Summary */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                      {/* Identity Card */}
                      <div
                        className="rounded-xl p-6 relative overflow-hidden group"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          backdropFilter: "blur(12px)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <span className="material-symbols-outlined text-5xl">
                            fingerprint
                          </span>
                        </div>
                        <h3 className="text-primary text-xs uppercase tracking-[0.2em] font-bold mb-4">
                          Identity
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-[#F5F5F7]/40 text-xs uppercase">
                              Archive Handle
                            </p>
                            <p className="text-xl font-medium">
                              @{handle || "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#F5F5F7]/40 text-xs uppercase">
                              Full Name
                            </p>
                            <p className="text-xl font-medium">{name || "—"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Expertise Card */}
                      <div
                        className="rounded-xl p-6"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          backdropFilter: "blur(12px)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <h3 className="text-primary text-xs uppercase tracking-[0.2em] font-bold mb-4">
                          Setup
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-primary/10 border border-primary/30 rounded-full text-sm text-primary font-medium">
                            {primaryOs}
                          </span>
                          <span className="px-3 py-1 bg-primary/10 border border-primary/30 rounded-full text-sm text-primary font-medium">
                            {preferredIde}
                          </span>
                          <span className="px-3 py-1 bg-primary/10 border border-primary/30 rounded-full text-sm text-primary font-medium">
                            {codingPhilosophy}
                          </span>
                        </div>
                      </div>

                      {/* Interests Card */}
                      <div
                        className="rounded-xl p-6"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          backdropFilter: "blur(12px)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <h3 className="text-primary text-xs uppercase tracking-[0.2em] font-bold mb-4">
                          Interests
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {interests.length > 0 ? (
                            interests.map((i) => (
                              <span
                                key={i}
                                className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-[#F5F5F7]/80"
                              >
                                {i}
                              </span>
                            ))
                          ) : (
                            <span className="text-[#F5F5F7]/30 text-sm">
                              No interests selected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Visualizer & Action */}
                    <div
                      className="lg:col-span-7 flex flex-col items-center justify-center rounded-xl p-8 relative"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      {/* Pulse Visualizer */}
                      <div className="relative mb-10">
                        <div className="w-48 h-48 rounded-full bg-primary/5 flex items-center justify-center border border-primary/20">
                          <div
                            className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center border border-primary/40"
                            style={{
                              animation: "pulse 2s infinite",
                            }}
                          >
                            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(13,70,242,0.8)]">
                              <span className="material-symbols-outlined text-white text-4xl">
                                sync
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="absolute -top-4 -left-4 w-4 h-4 bg-primary/40 rounded-full blur-sm" />
                        <div className="absolute -bottom-8 -right-4 w-6 h-6 bg-primary/40 rounded-full blur-sm" />
                      </div>

                      {/* Action */}
                      <div className="w-full max-w-md text-center">
                        <button
                          type="button"
                          onClick={handleFinalize}
                          disabled={loading}
                          className="w-full py-5 px-8 bg-primary hover:bg-blue-600 text-white font-bold text-lg rounded-lg shadow-[0_10px_40px_rgba(13,70,242,0.3)] transition-all transform hover:-translate-y-1 active:translate-y-0 mb-6 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span>
                            {loading ? "Syncing..." : "Initialize Final Sync"}
                          </span>
                          <span className="material-symbols-outlined">
                            rocket_launch
                          </span>
                        </button>
                        <div className="flex items-start justify-center gap-3 px-4">
                          <span className="material-symbols-outlined text-primary text-sm mt-0.5">
                            info
                          </span>
                          <p className="text-[#F5F5F7]/40 text-xs leading-relaxed text-left">
                            Your data will be immutable once synced to the
                            ledger. Future modifications require administrative
                            clearance. By clicking sync, you agree to the
                            Archive Protocols.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Back link */}
                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="text-[#F5F5F7]/40 hover:text-primary transition-colors text-sm font-medium"
                    >
                      Need to modify your data?{" "}
                      <span className="underline decoration-primary/40">
                        Step Back
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Footer Meta */}
            <div className="bg-white/[0.02] border-t border-white/5 p-4 flex justify-between items-center text-[10px] font-bold tracking-[0.2em] text-[#F5F5F7]/20 uppercase px-8">
              <span>System Secure</span>
              <span>Encrypted Archive Protocol</span>
            </div>
          </div>
        </main>

        {/* Pulse animation keyframes */}
        <style jsx>{`
          @keyframes pulse {
            0% {
              transform: scale(0.95);
              box-shadow: 0 0 0 0 rgba(13, 70, 242, 0.7);
            }
            70% {
              transform: scale(1);
              box-shadow: 0 0 0 20px rgba(13, 70, 242, 0);
            }
            100% {
              transform: scale(0.95);
              box-shadow: 0 0 0 0 rgba(13, 70, 242, 0);
            }
          }
        `}</style>
      </div>
    </>
  );
}
