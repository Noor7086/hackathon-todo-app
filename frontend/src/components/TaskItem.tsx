"use client";

import { useState } from "react";
import type { Task } from "@/types";
import { PriorityBadge } from "./PriorityBadge";
import { TagPill } from "./TagPill";

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: number) => Promise<void>;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => Promise<void>;
}

function formatDueDate(
  dueDate: string | null,
): { text: string; isOverdue: boolean; isToday: boolean } | null {
  if (!dueDate) return null;

  const due = new Date(dueDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

  const diffDays = Math.ceil(
    (dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0) {
    return {
      text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? "s" : ""}`,
      isOverdue: true,
      isToday: false,
    };
  } else if (diffDays === 0) {
    return { text: "Due today", isOverdue: false, isToday: true };
  } else if (diffDays === 1) {
    return { text: "Due tomorrow", isOverdue: false, isToday: false };
  } else if (diffDays <= 7) {
    return {
      text: `Due in ${diffDays} days`,
      isOverdue: false,
      isToday: false,
    };
  } else {
    return {
      text: `Due ${due.toLocaleDateString()}`,
      isOverdue: false,
      isToday: false,
    };
  }
}

export default function TaskItem({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskItemProps) {
  const [loading, setLoading] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await onToggleComplete(task.id);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(task.id);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const dueInfo = formatDueDate(task.due_date);
  const isOverdue = dueInfo?.isOverdue && !task.completed;

  return (
    <div
      className={`p-4 rounded-xl border transition-all hover:border-gray-600 ${
        task.completed
          ? "bg-emerald-900/10 border-emerald-800/50"
          : isOverdue
            ? "bg-red-900/10 border-red-800/50"
            : "bg-gray-800/50 border-gray-700/50"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
            task.completed
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-gray-600 hover:border-blue-500"
          }`}
          aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
        >
          {task.completed && (
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className={`font-medium ${
                task.completed ? "text-gray-500 line-through" : "text-gray-100"
              }`}
            >
              {task.title}
            </h3>
            <PriorityBadge priority={task.priority} />
            {task.recurrence_rule && (
              <span
                className="inline-flex items-center text-xs text-gray-500"
                title={`Recurs: ${task.recurrence_rule}`}
              >
                <svg
                  className="w-3 h-3 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Recurring
              </span>
            )}
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {task.tags.map((tag) => (
                <TagPill key={tag.id} tag={tag} />
              ))}
            </div>
          )}

          {/* Due date */}
          {dueInfo && (
            <p
              className={`text-xs mt-1 ${
                isOverdue
                  ? "text-red-400 font-medium"
                  : dueInfo.isToday
                    ? "text-amber-400"
                    : "text-gray-500"
              }`}
            >
              {dueInfo.text}
            </p>
          )}

          {task.description && (
            <button
              onClick={() => setShowDescription(!showDescription)}
              className="text-sm text-blue-400 hover:text-blue-300 mt-1 transition-colors"
            >
              {showDescription ? "Hide details" : "Show details"}
            </button>
          )}

          {showDescription && task.description && (
            <p className="mt-2 text-sm text-gray-400 whitespace-pre-wrap">
              {task.description}
            </p>
          )}
        </div>

        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => onEdit(task)}
            disabled={loading}
            className="px-3 py-1 text-sm text-gray-500 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition-all"
          >
            Edit
          </button>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading}
              className="px-3 py-1 text-sm text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"
            >
              Delete
            </button>
          ) : (
            <div className="flex gap-1">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
                className="px-3 py-1 text-sm text-gray-400 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
