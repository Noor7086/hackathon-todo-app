"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { demoLogin, isAuthenticated } from "@/lib/auth";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/tasks");
    }

    if (searchParams.get("expired") === "true") {
      setError("Your session has expired. Please login again.");
    }
  }, [router, searchParams]);

  const handleLogin = async (email: string, _password: string) => {
    try {
      setError("");
      await demoLogin(email);
      router.push("/tasks");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-[80vh] flex items-center justify-center">
      <div className="w-full animate-fade-in-up">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <span className="text-2xl font-bold gradient-text">TaskFlow</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-400">Login to access your dashboard</p>
        </div>

        <div className="glass-card p-8 glow-blue">
          <AuthForm mode="login" onSubmit={handleLogin} error={error} />

          <div className="mt-6 text-center text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-8 text-gray-400">Loading...</div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
