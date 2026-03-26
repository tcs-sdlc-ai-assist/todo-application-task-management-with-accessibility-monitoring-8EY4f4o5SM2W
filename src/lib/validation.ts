import { Priority, Status } from "@/src/lib/types";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function validateTaskTitle(title: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (title === undefined || title === null || typeof title !== "string") {
    errors.push({ field: "title", message: "Title is required." });
    return { valid: false, errors };
  }

  const trimmed = title.trim();

  if (trimmed.length === 0) {
    errors.push({ field: "title", message: "Title cannot be empty." });
    return { valid: false, errors };
  }

  if (trimmed.length > 255) {
    errors.push({
      field: "title",
      message: "Title must be 255 characters or fewer.",
    });
    return { valid: false, errors };
  }

  // Check for control characters
  // eslint-disable-next-line no-control-regex
  const controlCharRegex = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;
  if (controlCharRegex.test(trimmed)) {
    errors.push({
      field: "title",
      message: "Title must not contain control characters.",
    });
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}

export function validateTaskDescription(
  description: unknown
): ValidationResult {
  const errors: ValidationError[] = [];

  if (description === undefined || description === null) {
    return { valid: true, errors: [] };
  }

  if (typeof description !== "string") {
    errors.push({
      field: "description",
      message: "Description must be a string.",
    });
    return { valid: false, errors };
  }

  if (description.length > 2000) {
    errors.push({
      field: "description",
      message: "Description must be 2000 characters or fewer.",
    });
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}

export function validateDueDate(dueDate: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (dueDate === undefined || dueDate === null) {
    return { valid: true, errors: [] };
  }

  if (typeof dueDate !== "string" && !(dueDate instanceof Date)) {
    errors.push({
      field: "dueDate",
      message: "Due date must be a valid date string.",
    });
    return { valid: false, errors };
  }

  const parsed =
    dueDate instanceof Date ? dueDate : new Date(dueDate as string);

  if (isNaN(parsed.getTime())) {
    errors.push({
      field: "dueDate",
      message: "Due date must be a valid date.",
    });
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}

export function validatePriority(priority: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (priority === undefined || priority === null) {
    return { valid: true, errors: [] };
  }

  const validPriorities: string[] = Object.values(Priority);

  if (
    typeof priority !== "string" ||
    !validPriorities.includes(priority.toUpperCase())
  ) {
    errors.push({
      field: "priority",
      message: `Priority must be one of: ${validPriorities.join(", ")}.`,
    });
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}

export function validateStatus(status: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (status === undefined || status === null) {
    return { valid: true, errors: [] };
  }

  const validStatuses: string[] = Object.values(Status);

  if (
    typeof status !== "string" ||
    !validStatuses.includes(status.toUpperCase())
  ) {
    errors.push({
      field: "status",
      message: `Invalid status value. Must be one of: ${validStatuses.join(", ")}.`,
    });
    return { valid: false, errors };
  }

  return { valid: true, errors: [] };
}

export function validateTaskInput(input: Record<string, unknown>): ValidationResult {
  const allErrors: ValidationError[] = [];

  const titleResult = validateTaskTitle(input.title);
  if (!titleResult.valid) {
    allErrors.push(...titleResult.errors);
  }

  const descriptionResult = validateTaskDescription(input.description);
  if (!descriptionResult.valid) {
    allErrors.push(...descriptionResult.errors);
  }

  const dueDateResult = validateDueDate(input.dueDate);
  if (!dueDateResult.valid) {
    allErrors.push(...dueDateResult.errors);
  }

  const priorityResult = validatePriority(input.priority);
  if (!priorityResult.valid) {
    allErrors.push(...priorityResult.errors);
  }

  const statusResult = validateStatus(input.status);
  if (!statusResult.valid) {
    allErrors.push(...statusResult.errors);
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
  };
}

export function validateTaskUpdateInput(input: Record<string, unknown>): ValidationResult {
  const allErrors: ValidationError[] = [];

  if (input.title !== undefined) {
    const titleResult = validateTaskTitle(input.title);
    if (!titleResult.valid) {
      allErrors.push(...titleResult.errors);
    }
  }

  if (input.description !== undefined) {
    const descriptionResult = validateTaskDescription(input.description);
    if (!descriptionResult.valid) {
      allErrors.push(...descriptionResult.errors);
    }
  }

  if (input.dueDate !== undefined) {
    const dueDateResult = validateDueDate(input.dueDate);
    if (!dueDateResult.valid) {
      allErrors.push(...dueDateResult.errors);
    }
  }

  if (input.priority !== undefined) {
    const priorityResult = validatePriority(input.priority);
    if (!priorityResult.valid) {
      allErrors.push(...priorityResult.errors);
    }
  }

  if (input.status !== undefined) {
    const statusResult = validateStatus(input.status);
    if (!statusResult.valid) {
      allErrors.push(...statusResult.errors);
    }
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
  };
}

export function formatValidationErrors(
  errors: ValidationError[]
): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};

  for (const error of errors) {
    if (!grouped[error.field]) {
      grouped[error.field] = [];
    }
    grouped[error.field].push(error.message);
  }

  return grouped;
}