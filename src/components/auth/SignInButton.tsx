
"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export function SignInButton() {
  return (
    <Button 
      onClick={() => signIn("google")}
      variant="outline" 
      className="gap-2 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white"
    >
      <LogIn className="w-4 h-4" />
      Sign In
    </Button>
  );
}
