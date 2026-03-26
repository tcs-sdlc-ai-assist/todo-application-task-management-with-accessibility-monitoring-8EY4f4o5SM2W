"use client";

import React, { useState, useCallback } from "react";
import { TaskForm } from "@/src/components/TaskForm";
import { TaskList } from "@/src/components/TaskList";
import { ConfirmDialog } from "@/src/components/ConfirmDialog";
import { useToastContext } from "@/src/components/ToastContext";
import { useAccessibility } from "@/src/components/AccessibilityProvider";
import {
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
} from "@/src/lib/task-api";
import {
  Task,
  TaskCreateInput,
  TaskUpdateInput,
  Status,
} from "@/src/lib/types";

export default function HomePage() {
  const { addToast } = useToastContext();
  const { announce } = useAccessibility();

  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const handleShowCreateForm = useCallback(() => {
    setEditingTask(null);
    setShowForm(true);
  }, []);

  const handleCancelForm = useCallback(() => {
    setShowForm(false);
    setEditingTask(null);
  }, []);

  const handleCreateSubmit = useCallback(
    async (data: TaskCreateInput | TaskUpdateInput) => {
      await apiCreateTask(data as TaskCreateInput);
      setShowForm(false);
      triggerRefresh();
      addToast("success", "Task created successfully.");
      announce("Task created successfully.");
    },
    [triggerRefresh, addToast, announce]
  );

  const handleEditSubmit = useCallback(
    async (data: TaskCreateInput | TaskUpdateInput) => {
      if (!editingTask) return;

      await apiUpdateTask(editingTask.id, data as TaskUpdateInput);
      setEditingTask(null);
      setShowForm(false);
      triggerRefresh();
      addToast("success", "Task updated successfully.");
      announce("Task updated successfully.");
    },
    [editingTask, triggerRefresh, addToast, announce]
  );

  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  }, []);

  const handleDeleteRequest = useCallback((task: Task) => {
    setDeletingTask(task);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingTask) return;

    try {
      await apiDeleteTask(deletingTask.id);
      setDeletingTask(null);
      triggerRefresh();
      addToast("success", "Task deleted successfully.");
      announce("Task deleted successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete task.";
      addToast("error", message);
      announce(message, "assertive");
    }
  }, [deletingTask, triggerRefresh, addToast, announce]);

  const handleDeleteCancel = useCallback(() => {
    setDeletingTask(null);
  }, []);

  const handleToggleStatus = useCallback(
    async (id: string, status: Status) => {
      try {
        const response = await fetch(`/api/tasks/${encodeURIComponent(id)}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ status }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({
            error: `Request failed with status ${response.status}.`,
          }));
          throw new Error(body.error || `Request failed with status ${response.status}.`);
        }

        triggerRefresh();

        const label =
          status === Status.DONE
            ? "Task marked as complete."
            : "Task marked as incomplete.";
        addToast("success", label);
        announce(label);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to update task status.";
        addToast("error", message);
        announce(message, "assertive");
      }
    },
    [triggerRefresh, addToast, announce]
  );

  const isEditing = editingTask !== null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-hc-fg sm:text-xl">
          My Tasks
        </h2>
        {!showForm && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleShowCreateForm}
            aria-label="Create a new task"
          >
            New Task
          </button>
        )}
      </div>

      {showForm && (
        <TaskForm
          mode={isEditing ? "edit" : "create"}
          initialData={
            isEditing
              ? {
                  title: editingTask.title,
                  description: editingTask.description,
                  dueDate: editingTask.dueDate,
                  priority: editingTask.priority,
                }
              : undefined
          }
          onSubmit={isEditing ? handleEditSubmit : handleCreateSubmit}
          onCancel={handleCancelForm}
        />
      )}

      <TaskList
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
        onToggleStatus={handleToggleStatus}
        refreshKey={refreshKey}
      />

      <ConfirmDialog
        open={deletingTask !== null}
        title="Delete Task"
        message={
          deletingTask
            ? `Are you sure you want to delete "${deletingTask.title}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}