"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[#0a0a0a] text-[#e2e2e2] selection:bg-primary selection:text-white">
      {/* Grain Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="flex w-full">
        {/* Left Side: Login Form */}
        <div className="z-10 flex w-full flex-col justify-between p-6 lg:w-1/2 xl:p-10">
          {/* Header */}
          <header className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-white shadow-[0_0_15px_rgba(13,70,242,0.4)]">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold tracking-[0.2em] text-white">
              THE ARCHIVE
            </h2>
          </header>

          {/* Form Section */}
          <div className="mx-auto flex w-full max-w-md flex-col justify-center py-4">
            <div className="mb-6">
              <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                Awaiting Credentials
              </h1>
              <p className="text-[#e2e2e2]/60 font-medium">
                Secure System Access Required
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label
                  className="text-sm font-semibold tracking-wider text-[#e2e2e2]/80 uppercase"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    className="w-full rounded-lg border-none bg-[#1a1c23] py-3 px-4 text-white placeholder:text-[#e2e2e2]/30 focus:ring-2 focus:ring-primary transition-all duration-300 outline-none"
                    id="email"
                    placeholder="user@archive.net"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <div className="absolute inset-0 rounded-lg border border-white/5 pointer-events-none group-hover:border-white/10 transition-colors" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label
                    className="text-sm font-semibold tracking-wider text-[#e2e2e2]/80 uppercase"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <Link
                    href="#"
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative group">
                  <input
                    className="w-full rounded-lg border-none bg-[#1a1c23] py-3 px-4 text-white placeholder:text-[#e2e2e2]/30 focus:ring-2 focus:ring-primary transition-all duration-300 outline-none"
                    id="password"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div className="absolute inset-0 rounded-lg border border-white/5 pointer-events-none group-hover:border-white/10 transition-colors" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary py-3 text-sm font-bold tracking-[0.1em] text-white uppercase shadow-[0_4px_20px_rgba(13,70,242,0.3)] hover:shadow-[0_4px_25px_rgba(13,70,242,0.5)] hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Connecting..." : "Initialize Session"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-5 flex items-center py-2">
              <div className="flex-grow border-t border-white/5" />
              <span className="mx-4 flex-shrink-0 text-xs font-bold tracking-widest text-[#e2e2e2]/30 uppercase">
                Connect via Network
              </span>
              <div className="flex-grow border-t border-white/5" />
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
                className="flex items-center justify-center gap-3 rounded-lg border border-white/5 bg-[#1a1c23] py-3 hover:bg-white/5 transition-colors group cursor-pointer"
              >
                <svg
                  className="h-5 w-5 text-[#e2e2e2] group-hover:text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.412-4.041-1.412-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="text-xs font-bold tracking-widest uppercase">
                  GitHub
                </span>
              </button>
              <button
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="flex items-center justify-center gap-3 rounded-lg border border-white/5 bg-[#1a1c23] py-3 hover:bg-white/5 transition-colors group cursor-pointer"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-xs font-bold tracking-widest uppercase">
                  Google
                </span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <footer className="flex items-center justify-between text-xs font-medium text-[#e2e2e2]/40">
            <p>© 2025 THE ARCHIVE PROTOCOL</p>
            <div className="flex gap-4">
              <Link
                href="/register"
                className="hover:text-primary transition-colors"
              >
                Request Access
              </Link>
              <span className="text-white/10">|</span>
              <Link
                href="/manifesto"
                className="hover:text-primary transition-colors"
              >
                Documentation
              </Link>
            </div>
          </footer>
        </div>

        {/* Right Side: Visual Panel */}
        <div className="relative hidden h-screen w-1/2 lg:block">
          {/* Base Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/login.jpeg"
              alt="The Archive Login"
              fill
              className="object-cover opacity-100 contrast-110 saturate-90"
              priority
            />
          </div>

          {/* Abstract Background Overlay */}
          <div className="absolute inset-0 z-1 h-full w-full bg-gradient-to-br from-[#0a0a0a] via-[#111318]/80 to-[#0d46f2]/20" />

          {/* Overlay Gradients */}
          <div className="absolute inset-0 z-2 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />
          <div className="absolute inset-0 z-2 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/30" />

          {/* Tech Grid */}
          <div className="absolute inset-0 pointer-events-none opacity-20 z-10" style={{
            backgroundImage: 'radial-gradient(#0d46f2 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />

          {/* Floating Badge */}
          <div className="absolute bottom-16 right-16 flex flex-col items-end z-20">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20 text-primary">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest text-[#e2e2e2]/40 uppercase">System Status</p>
                <p className="text-lg font-bold text-white tracking-tight">ENCRYPTED NODE 01-A</p>
              </div>
            </div>
            <div className="mt-4 flex gap-6 text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">
              <span>Lvl 4 Security</span>
              <span>Zero Knowledge</span>
              <span>Multi-Region</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
