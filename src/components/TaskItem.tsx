"use client";

import React, { useCallback, useState } from "react";
import { Task, Priority, Status } from "@/src/lib/types";

interface TaskItemProps {
  task: Task;
  onToggleStatus: (id: string, status: Status) => Promise<void>;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

function getPriorityLabel(priority: Priority | null): string | null {
  switch (priority) {
    case Priority.HIGH:
      return "High";
    case Priority.MEDIUM:
      return "Medium";
    case Priority.LOW:
      return "Low";
    default:
      return null;
  }
}

function getPriorityStyles(priority: Priority | null): string {
  switch (priority) {
    case Priority.HIGH:
      return "border-hc-error text-hc-error";
    case Priority.MEDIUM:
      return "border-hc-fg text-hc-fg";
    case Priority.LOW:
      return "border-hc-border text-hc-fg opacity-70";
    default:
      return "";
  }
}

function formatDueDate(dueDate: Date | string | null): string | null {
  if (!dueDate) return null;
  const parsed = dueDate instanceof Date ? dueDate : new Date(dueDate);
  if (isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function TaskItem({ task, onToggleStatus, onEdit, onDelete }: TaskItemProps) {
  const [toggling, setToggling] = useState<boolean>(false);

  const isCompleted = task.status === Status.DONE;
  const priorityLabel = getPriorityLabel(task.priority);
  const priorityStyles = getPriorityStyles(task.priority);
  const formattedDueDate = formatDueDate(task.dueDate);

  const handleToggleStatus = useCallback(async () => {
    if (toggling) return;

    setToggling(true);

    const newStatus = isCompleted ? Status.TODO : Status.DONE;

    try {
      await onToggleStatus(task.id, newStatus);
    } catch {
      // Error handling is managed by the parent component
    } finally {
      setToggling(false);
    }
  }, [toggling, isCompleted, onToggleStatus, task.id]);

  const handleCheckboxKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleToggleStatus();
      }
    },
    [handleToggleStatus]
  );

  const handleEdit = useCallback(() => {
    onEdit(task);
  }, [onEdit, task]);

  const handleDelete = useCallback(() => {
    onDelete(task);
  }, [onDelete, task]);

  const descriptionPreview =
    task.description && task.description.length > 120
      ? `${task.description.substring(0, 120)}…`
      : task.description;

  return (
    <li
      className={`card flex items-start gap-3 ${isCompleted ? "opacity-70" : ""}`}
      aria-label={`Task: ${task.title}${isCompleted ? ", completed" : ""}`}
    >
      <div className="flex-shrink-0 pt-0.5">
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={handleToggleStatus}
          onKeyDown={handleCheckboxKeyDown}
          disabled={toggling}
          aria-label={
            isCompleted
              ? `Mark "${task.title}" as incomplete`
              : `Mark "${task.title}" as complete`
          }
          aria-busy={toggling}
          className="h-5 w-5 rounded border-hc-border text-hc-fg accent-hc-fg cursor-pointer disabled:cursor-not-allowed"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3
            className={`text-sm font-semibold text-hc-fg ${
              isCompleted ? "line-through" : ""
            }`}
          >
            {task.title}
          </h3>

          {priorityLabel && (
            <span
              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${priorityStyles}`}
              aria-label={`Priority: ${priorityLabel}`}
            >
              {priorityLabel}
            </span>
          )}
        </div>

        {descriptionPreview && (
          <p
            className={`mt-1 text-sm text-hc-fg ${
              isCompleted ? "line-through opacity-70" : "opacity-80"
            }`}
          >
            {descriptionPreview}
          </p>
        )}

        {formattedDueDate && (
          <p className="mt-1 text-xs text-hc-fg opacity-60">
            <span aria-hidden="true">📅 </span>
            <span>Due: {formattedDueDate}</span>
          </p>
        )}
      </div>

      <div className="flex-shrink-0 flex items-center gap-2">
        <button
          type="button"
          className="btn text-xs px-3 py-1"
          onClick={handleEdit}
          aria-label={`Edit task "${task.title}"`}
        >
          Edit
        </button>
        <button
          type="button"
          className="btn btn-danger text-xs px-3 py-1"
          onClick={handleDelete}
          aria-label={`Delete task "${task.title}"`}
        >
          Delete
        </button>
      </div>
    </li>
  );
}