"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Reusable layout wrapper
const ParentLayout = ({ children }: { children: ReactNode }) => (
  <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#3b82f6] to-[#6366f1] px-4 text-white">
    <div className="container flex max-w-xl flex-col items-center justify-center gap-12 py-16">
      <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">Air Table</h1>
      {children}
    </div>
  </main>
);

export function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signIn("google", { redirect: false });
    } catch (err) {
      setError("Failed to sign in. Please try again.");
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return <ParentLayout>Loading...</ParentLayout>;
  }

  if (session) {
    return <ParentLayout>Redirecting...</ParentLayout>;
  }

  return (
    <ParentLayout>
      <button
  className="rounded-lg bg-white text-[#3b82f6] border border-[#3b82f6] px-6 py-3 font-bold hover:bg-[#e0e7ff] transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
  disabled={isLoading}
  onClick={handleSignIn}
>
  {isLoading ? "Signing in..." : "Sign in with Google"}
</button>


      {error && <p className="mt-4 text-red-500">{error}</p>}
    </ParentLayout>
  );
}
