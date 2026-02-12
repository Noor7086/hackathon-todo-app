"use client";

import type { Priority } from "@/types";

interface PriorityBadgeProps {
  priority: Priority;
  size?: "sm" | "md";
}

const priorityConfig: Record<
  Priority,
  { label: string; color: string; bg: string }
> = {
  urgent: { label: "Urgent", color: "text-red-400", bg: "bg-red-900/30" },
  high: { label: "High", color: "text-orange-400", bg: "bg-orange-900/30" },
  medium: { label: "Medium", color: "text-blue-400", bg: "bg-blue-900/30" },
  low: { label: "Low", color: "text-gray-400", bg: "bg-gray-800" },
};

export function PriorityBadge({ priority, size = "sm" }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  const sizeClasses =
    size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.bg} ${config.color} ${sizeClasses}`}
    >
      {config.label}
    </span>
  );
}
