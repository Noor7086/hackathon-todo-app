"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { demoLogin, isAuthenticated } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/tasks");
    }
  }, [router]);

  const handleRegister = async (email: string, _password: string) => {
    try {
      setError("");
      await demoLogin(email);
      router.push("/tasks");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
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
            Create Account
          </h1>
          <p className="text-gray-400">Start managing your tasks today</p>
        </div>

        <div className="glass-card p-8 glow-purple">
          <AuthForm mode="register" onSubmit={handleRegister} error={error} />

          <div className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
