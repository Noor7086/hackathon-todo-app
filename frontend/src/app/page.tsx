"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/tasks");
    }
  }, [router]);

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center text-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float delay-200" />

      {/* Content */}
      <div className="relative z-10 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 border border-gray-700 text-sm text-gray-400 mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          AI-Powered Task Management
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold mb-6">
          <span className="text-gray-100">Manage Tasks</span>
          <br />
          <span className="gradient-text">Smarter & Faster</span>
        </h1>

        <p className="text-lg text-gray-400 mb-10 max-w-lg mx-auto leading-relaxed">
          A beautiful task dashboard with AI chat assistant, smart analytics,
          and everything you need to stay productive.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            Get Started
          </Link>
          <Link
            href="/register"
            className="px-8 py-3.5 bg-gray-800 text-gray-300 rounded-xl font-medium hover:bg-gray-700 transition-all border border-gray-700 hover:border-gray-600"
          >
            Create Account
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div
        className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20 w-full max-w-2xl animate-fade-in-up delay-300"
        style={{ opacity: 0 }}
      >
        {[
          {
            icon: "📊",
            title: "Smart Dashboard",
            desc: "Visual analytics for your tasks",
          },
          {
            icon: "🤖",
            title: "AI Assistant",
            desc: "Chat to manage your tasks",
          },
          {
            icon: "⚡",
            title: "Lightning Fast",
            desc: "Built with modern tech stack",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="glass-card p-5 text-center hover:border-gray-600 transition-all"
          >
            <div className="text-2xl mb-2">{feature.icon}</div>
            <h3 className="font-semibold text-gray-200 text-sm">
              {feature.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
