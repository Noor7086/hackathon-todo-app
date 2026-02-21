"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Tag, Task, TaskCreate, TaskFilters, TaskUpdate } from "@/types";
import { api } from "@/lib/api";
import { getSession, logout, isAuthenticated } from "@/lib/auth";
import TaskList from "@/components/TaskList";
import TaskForm from "@/components/TaskForm";
import { FilterPanel } from "@/components/FilterPanel";

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");

  const loadTasks = useCallback(
    async (currentFilters?: TaskFilters) => {
      const session = getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      setUserId(session.user.id);
      setUserEmail(session.user.email);
      setLoading(true);
      setError(null);

      try {
        const [tasksData, tagsData] = await Promise.all([
          api.getTasks(session.user.id, currentFilters),
          api.getTags(session.user.id),
        ]);
        setTasks(tasksData);
        setTags(tagsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  const handleFiltersChange = useCallback(
    (newFilters: TaskFilters) => {
      setFilters(newFilters);
      loadTasks(newFilters);
    },
    [loadTasks],
  );

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    loadTasks();
  }, [router, loadTasks]);

  const handleCreateTask = async (data: TaskCreate | TaskUpdate) => {
    const newTask = await api.createTask(userId, data as TaskCreate);
    setTasks((prev) => [...prev, newTask]);
    setShowForm(false);
  };

  const handleUpdateTask = async (data: TaskCreate | TaskUpdate) => {
    if (!editingTask) return;
    const updatedTask = await api.updateTask(
      userId,
      editingTask.id,
      data as TaskUpdate,
    );
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
    );
    setEditingTask(null);
  };

  const handleToggleComplete = async (taskId: number) => {
    const updatedTask = await api.toggleComplete(userId, taskId);
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
    );
  };

  const handleDeleteTask = async (taskId: number) => {
    await api.deleteTask(userId, taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const overdueCount = tasks.filter((t) => {
    if (!t.due_date || t.completed) return false;
    return new Date(t.due_date) < new Date();
  }).length;
  const completionPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const priorityCounts = {
    urgent: tasks.filter((t) => t.priority === "urgent" && !t.completed).length,
    high: tasks.filter((t) => t.priority === "high" && !t.completed).length,
    medium: tasks.filter((t) => t.priority === "medium" && !t.completed).length,
    low: tasks.filter((t) => t.priority === "low" && !t.completed).length,
  };
  const maxPriority = Math.max(...Object.values(priorityCounts), 1);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <span className="gradient-text">TaskFlow</span>
          </h1>
          <p className="text-sm text-gray-500">{userEmail}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-all text-sm"
        >
          Logout
        </button>
      </div>

      {/* Navigation */}
      <div className="flex gap-2 mb-8">
        <span className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium shadow-lg shadow-blue-500/20">
          Dashboard
        </span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="glass-card p-4">
          <p className="text-2xl font-bold text-blue-400">{totalCount}</p>
          <p className="text-xs text-gray-500 mt-1">Total Tasks</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-2xl font-bold text-amber-400">{pendingCount}</p>
          <p className="text-xs text-gray-500 mt-1">Pending</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-2xl font-bold text-emerald-400">
            {completedCount}
          </p>
          <p className="text-xs text-gray-500 mt-1">Completed</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-2xl font-bold text-red-400">{overdueCount}</p>
          <p className="text-xs text-gray-500 mt-1">Overdue</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Completion Ring */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-gray-400 mb-4">
            Completion Rate
          </h3>
          <div className="flex items-center gap-6">
            <div
              className="donut-chart"
              style={{
                background: `conic-gradient(#3b82f6 0% ${completionPercent}%, #1f2937 ${completionPercent}% 100%)`,
              }}
            >
              <div className="donut-inner">
                <span className="text-2xl font-bold text-gray-100">
                  {completionPercent}%
                </span>
                <span className="text-xs text-gray-500">done</span>
              </div>
            </div>
            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  Completed
                </span>
                <span className="text-gray-300 font-medium">
                  {completedCount}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  Pending
                </span>
                <span className="text-gray-300 font-medium">
                  {pendingCount}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  Overdue
                </span>
                <span className="text-gray-300 font-medium">
                  {overdueCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-gray-400 mb-4">
            Priority Distribution
          </h3>
          <div className="space-y-3">
            {[
              {
                label: "Urgent",
                count: priorityCounts.urgent,
                color: "bg-red-500",
              },
              {
                label: "High",
                count: priorityCounts.high,
                color: "bg-orange-500",
              },
              {
                label: "Medium",
                count: priorityCounts.medium,
                color: "bg-blue-500",
              },
              { label: "Low", count: priorityCounts.low, color: "bg-gray-500" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="text-gray-300 font-medium">
                    {item.count}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${item.color}`}
                    style={{ width: `${(item.count / maxPriority) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Task Button */}
      <button
        onClick={() => setShowForm(true)}
        className="w-full mb-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add Task
      </button>

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        tags={tags}
      />

      {/* Task List */}
      <TaskList
        tasks={tasks}
        loading={loading}
        error={error}
        onToggleComplete={handleToggleComplete}
        onEdit={(task) => setEditingTask(task)}
        onDelete={handleDeleteTask}
        onRetry={loadTasks}
      />

      {/* Task Form Modal */}
      {(showForm || editingTask) && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onCancel={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}
