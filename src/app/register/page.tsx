"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-[#0a0a0c] text-white overflow-hidden selection:bg-primary selection:text-white">
      {/* Left Side: Visual Experience */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 overflow-hidden border-r border-white/5">
        {/* Abstract Background */}
        <div className="absolute inset-0 z-0">
          <div className="h-full w-full bg-gradient-to-br from-[#0a0a0c] via-[#111318] to-primary/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-[#0a0a0c]/20" />
          {/* Tech Grid */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(#0d46f2 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Header/Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary flex items-center justify-center rounded-sm">
            <svg
              className="h-5 w-5 text-white"
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
          <h2
            className="text-xl font-bold tracking-tighter uppercase text-white"
            style={{ letterSpacing: "0.05em" }}
          >
            The Archive
          </h2>
        </div>

        {/* Bottom Content */}
        <div className="relative z-10 max-w-md">
          <div className="mb-6 flex items-center gap-2 text-primary">
            <span className="h-px w-8 bg-primary" />
            <span
              className="uppercase text-xs font-bold tracking-[0.05em]"
              style={{ fontFamily: "monospace" }}
            >
              Encrypted Repository
            </span>
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-4">
            Secure digital masonry for the elite.
          </h1>
          <p className="text-[#e2e2e2]/60 text-lg">
            Access a curated vault of architectural insights, high-fidelity
            assets, and exclusive design documentation.
          </p>
        </div>
      </div>

      {/* Right Side: Registration Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 lg:p-24 bg-[#0a0a0c] relative">
        {/* Mobile Header */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-3">
          <div className="w-6 h-6 bg-primary flex items-center justify-center rounded-sm">
            <svg
              className="h-4 w-4 text-white"
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
          <h2
            className="text-sm font-bold tracking-tighter uppercase"
            style={{ letterSpacing: "0.05em" }}
          >
            The Archive
          </h2>
        </div>

        <div className="w-full max-w-[440px] flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Request Access
            </h2>
            <p className="text-[#e2e2e2]/50 text-sm">
              Submit your credentials for vault verification.
            </p>
          </div>

          <form
            className="flex flex-col gap-5"
            onSubmit={(e) => e.preventDefault()}
          >
            {/* Full Name */}
            <div className="flex flex-col gap-2">
              <label
                className="uppercase text-[10px] text-[#e2e2e2]/60 font-medium ml-1 tracking-[0.05em]"
                style={{ fontFamily: "monospace" }}
              >
                Full Name
              </label>
              <div className="relative">
                <input
                  className="w-full bg-[#111318] border border-white/10 rounded-lg py-4 px-4 text-white placeholder:text-white/20 transition-all outline-none focus:border-primary focus:shadow-[0_0_0_1px_#0d46f2]"
                  placeholder="e.g. Julian Kane"
                  type="text"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-2">
              <label
                className="uppercase text-[10px] text-[#e2e2e2]/60 font-medium ml-1 tracking-[0.05em]"
                style={{ fontFamily: "monospace" }}
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  className="w-full bg-[#111318] border border-white/10 rounded-lg py-4 px-4 text-white placeholder:text-white/20 transition-all outline-none focus:border-primary focus:shadow-[0_0_0_1px_#0d46f2]"
                  placeholder="name@domain.com"
                  type="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label
                className="uppercase text-[10px] text-[#e2e2e2]/60 font-medium ml-1 tracking-[0.05em]"
                style={{ fontFamily: "monospace" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full bg-[#111318] border border-white/10 rounded-lg py-4 px-4 text-white placeholder:text-white/20 transition-all outline-none focus:border-primary focus:shadow-[0_0_0_1px_#0d46f2]"
                  placeholder="••••••••"
                  type="password"
                />
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 px-1 py-2">
              <input
                className="mt-1 rounded-sm bg-[#111318] border-white/20 text-primary focus:ring-primary"
                id="terms"
                type="checkbox"
              />
              <label
                className="text-xs text-[#e2e2e2]/40 leading-relaxed"
                htmlFor="terms"
              >
                I acknowledge that &apos;The Archive&apos; is an invitation-only
                repository and I agree to the{" "}
                <Link
                  href="#"
                  className="text-[#e2e2e2]/80 underline underline-offset-4"
                >
                  Vault Confidentiality Agreement
                </Link>
                .
              </label>
            </div>

            {/* CTA */}
            <button
              type="submit"
              className="mt-2 w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-2 group border border-primary/50 shadow-[0_0_20px_rgba(13,70,242,0.15)]"
            >
              <span
                className="uppercase tracking-widest text-sm"
                style={{ fontFamily: "monospace" }}
              >
                Request Access
              </span>
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-white/5" />
            <span className="mx-4 flex-shrink-0 text-xs font-bold tracking-widest text-[#e2e2e2]/30 uppercase">
              Or connect via
            </span>
            <div className="flex-grow border-t border-white/5" />
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
              className="flex items-center justify-center gap-3 rounded-lg border border-white/5 bg-[#111318] py-3.5 hover:bg-white/5 transition-colors group cursor-pointer"
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
              className="flex items-center justify-center gap-3 rounded-lg border border-white/5 bg-[#111318] py-3.5 hover:bg-white/5 transition-colors group cursor-pointer"
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

          {/* Footer Link */}
          <div className="flex items-center justify-center gap-2 pt-4 border-t border-white/5">
            <span className="text-sm text-[#e2e2e2]/40">Already a member?</span>
            <Link
              href="/login"
              className="text-sm text-white font-medium hover:text-primary transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Bottom decorative */}
        <div className="absolute bottom-8 right-8 hidden lg:block">
          <p
            className="uppercase text-[10px] text-[#e2e2e2]/20 tracking-[0.05em]"
            style={{ fontFamily: "monospace" }}
          >
            System Status: <span className="text-emerald-500">Online</span> //
            v4.0.2
          </p>
        </div>
      </div>
    </div>
  );
}
