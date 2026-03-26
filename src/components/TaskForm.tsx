"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { TaskCreateInput, TaskUpdateInput, Priority } from "@/src/lib/types";

type TaskFormMode = "create" | "edit";

interface TaskFormProps {
  mode: TaskFormMode;
  initialData?: Partial<TaskCreateInput>;
  onSubmit: (data: TaskCreateInput | TaskUpdateInput) => Promise<void>;
  onCancel: () => void;
}

interface FormErrors {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: string;
}

function formatDateForInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  const parsed = date instanceof Date ? date : new Date(date);
  if (isNaN(parsed.getTime())) return "";
  return parsed.toISOString().split("T")[0];
}

export function TaskForm({ mode, initialData, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState<string>(initialData?.title ?? "");
  const [description, setDescription] = useState<string>(
    initialData?.description ?? ""
  );
  const [dueDate, setDueDate] = useState<string>(
    formatDateForInput(initialData?.dueDate)
  );
  const [priority, setPriority] = useState<string>(
    initialData?.priority ?? ""
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState<boolean>(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  const validate = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      newErrors.title = "Title is required.";
    } else if (trimmedTitle.length > 255) {
      newErrors.title = "Title must be 255 characters or fewer.";
    } else {
      // eslint-disable-next-line no-control-regex
      const controlCharRegex = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;
      if (controlCharRegex.test(trimmedTitle)) {
        newErrors.title = "Title must not contain control characters.";
      }
    }

    if (description && description.length > 2000) {
      newErrors.description = "Description must be 2000 characters or fewer.";
    }

    if (dueDate) {
      const parsed = new Date(dueDate);
      if (isNaN(parsed.getTime())) {
        newErrors.dueDate = "Due date must be a valid date.";
      }
    }

    if (priority) {
      const validPriorities = Object.values(Priority);
      if (!validPriorities.includes(priority as Priority)) {
        newErrors.priority = `Priority must be one of: ${validPriorities.join(", ")}.`;
      }
    }

    return newErrors;
  }, [title, description, dueDate, priority]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validationErrors = validate();
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        const firstErrorField = Object.keys(validationErrors)[0];
        const errorElement = formRef.current?.querySelector<HTMLElement>(
          `[name="${firstErrorField}"]`
        );
        errorElement?.focus();
        return;
      }

      setSubmitting(true);

      try {
        const data: TaskCreateInput | TaskUpdateInput = {
          title: title.trim(),
          description: description.trim() || null,
          dueDate: dueDate || null,
          priority: priority ? (priority as Priority) : null,
        };

        await onSubmit(data);
      } catch {
        // Error handling is managed by the parent component
      } finally {
        setSubmitting(false);
      }
    },
    [title, description, dueDate, priority, validate, onSubmit]
  );

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
      if (errors.title) {
        setErrors((prev) => ({ ...prev, title: undefined }));
      }
    },
    [errors.title]
  );

  const handleDescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setDescription(e.target.value);
      if (errors.description) {
        setErrors((prev) => ({ ...prev, description: undefined }));
      }
    },
    [errors.description]
  );

  const handleDueDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDueDate(e.target.value);
      if (errors.dueDate) {
        setErrors((prev) => ({ ...prev, dueDate: undefined }));
      }
    },
    [errors.dueDate]
  );

  const handlePriorityChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setPriority(e.target.value);
      if (errors.priority) {
        setErrors((prev) => ({ ...prev, priority: undefined }));
      }
    },
    [errors.priority]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    },
    [onCancel]
  );

  const formTitle = mode === "create" ? "Create Task" : "Edit Task";
  const submitLabel = mode === "create" ? "Create Task" : "Save Changes";
  const submittingLabel = mode === "create" ? "Creating..." : "Saving...";

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="card flex flex-col gap-4"
      aria-label={formTitle}
      noValidate
    >
      <h2 className="text-lg font-bold text-hc-fg">{formTitle}</h2>

      <div>
        <label htmlFor="task-title" className="label">
          Title <span aria-hidden="true">*</span>
          <span className="sr-only">(required)</span>
        </label>
        <input
          ref={titleInputRef}
          id="task-title"
          name="title"
          type="text"
          className="input"
          value={title}
          onChange={handleTitleChange}
          maxLength={255}
          required
          aria-required="true"
          aria-invalid={errors.title ? "true" : undefined}
          aria-describedby={errors.title ? "task-title-error" : undefined}
          disabled={submitting}
          placeholder="Enter task title"
          autoComplete="off"
        />
        {errors.title && (
          <p id="task-title-error" className="error-text" role="alert">
            {errors.title}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="task-description" className="label">
          Description
        </label>
        <textarea
          id="task-description"
          name="description"
          className="input"
          value={description}
          onChange={handleDescriptionChange}
          maxLength={2000}
          rows={3}
          aria-invalid={errors.description ? "true" : undefined}
          aria-describedby={
            errors.description ? "task-description-error" : undefined
          }
          disabled={submitting}
          placeholder="Enter task description (optional)"
        />
        {errors.description && (
          <p id="task-description-error" className="error-text" role="alert">
            {errors.description}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="task-due-date" className="label">
          Due Date
        </label>
        <input
          id="task-due-date"
          name="dueDate"
          type="date"
          className="input"
          value={dueDate}
          onChange={handleDueDateChange}
          aria-invalid={errors.dueDate ? "true" : undefined}
          aria-describedby={errors.dueDate ? "task-due-date-error" : undefined}
          disabled={submitting}
        />
        {errors.dueDate && (
          <p id="task-due-date-error" className="error-text" role="alert">
            {errors.dueDate}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="task-priority" className="label">
          Priority
        </label>
        <select
          id="task-priority"
          name="priority"
          className="input"
          value={priority}
          onChange={handlePriorityChange}
          aria-invalid={errors.priority ? "true" : undefined}
          aria-describedby={
            errors.priority ? "task-priority-error" : undefined
          }
          disabled={submitting}
        >
          <option value="">None</option>
          <option value={Priority.LOW}>Low</option>
          <option value={Priority.MEDIUM}>Medium</option>
          <option value={Priority.HIGH}>High</option>
        </select>
        {errors.priority && (
          <p id="task-priority-error" className="error-text" role="alert">
            {errors.priority}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          className="btn"
          onClick={onCancel}
          disabled={submitting}
          aria-label="Cancel"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
          aria-busy={submitting}
          aria-label={submitting ? submittingLabel : submitLabel}
        >
          {submitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}