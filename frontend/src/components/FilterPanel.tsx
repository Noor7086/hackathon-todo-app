"use client";

import { useState } from "react";
import type { Priority, Tag, TaskFilters } from "@/types";

interface FilterPanelProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  tags: Tag[];
}

export function FilterPanel({
  filters,
  onFiltersChange,
  tags,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = <K extends keyof TaskFilters>(
    key: K,
    value: TaskFilters[K],
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== "" && v !== false,
  );

  const selectStyles =
    "rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all";

  return (
    <div className="mb-4 rounded-xl border border-gray-800 bg-gray-900/50 p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.search || ""}
              onChange={(e) =>
                updateFilter("search", e.target.value || undefined)
              }
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 pl-9 text-sm text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
            <svg
              className="absolute left-3 top-2.5 h-4 w-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Quick filters */}
          <select
            value={filters.status || "all"}
            onChange={(e) =>
              updateFilter(
                "status",
                e.target.value === "all"
                  ? undefined
                  : (e.target.value as TaskFilters["status"]),
              )
            }
            className={selectStyles}
          >
            <option value="all">All Status</option>
            <option value="incomplete">Pending</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={filters.priority || ""}
            onChange={(e) =>
              updateFilter(
                "priority",
                (e.target.value || undefined) as Priority | undefined,
              )
            }
            className={selectStyles}
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            {isExpanded ? "Less filters" : "More filters"}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="rounded-lg bg-gray-800 px-3 py-1 text-sm text-gray-400 hover:bg-gray-700 hover:text-gray-200 transition-all"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-gray-800 pt-4 animate-slide-down">
          {/* Tag filter */}
          <select
            value={filters.tag || ""}
            onChange={(e) => updateFilter("tag", e.target.value || undefined)}
            className={selectStyles}
          >
            <option value="">All Tags</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.name}>
                {tag.name}
              </option>
            ))}
          </select>

          {/* Overdue toggle */}
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={filters.overdue || false}
              onChange={(e) =>
                updateFilter("overdue", e.target.checked || undefined)
              }
              className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500/50"
            />
            Show only overdue
          </label>

          {/* Sort */}
          <select
            value={`${filters.sort || "created_at"}-${filters.order || "desc"}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split("-");
              updateFilter("sort", sort);
              updateFilter("order", order as "asc" | "desc");
            }}
            className={selectStyles}
          >
            <option value="created_at-desc">Newest first</option>
            <option value="created_at-asc">Oldest first</option>
            <option value="due_date-asc">Due date (earliest)</option>
            <option value="due_date-desc">Due date (latest)</option>
            <option value="priority-desc">Priority (highest)</option>
            <option value="priority-asc">Priority (lowest)</option>
          </select>
        </div>
      )}
    </div>
  );
}
