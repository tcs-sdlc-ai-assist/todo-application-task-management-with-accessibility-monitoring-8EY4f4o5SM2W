import {
  createTask as repoCreateTask,
  getTaskById,
  listTasks as repoListTasks,
  updateTask as repoUpdateTask,
  deleteTask as repoDeleteTask,
  toggleTaskStatus as repoToggleTaskStatus,
  ListTasksParams,
  ListTasksResult,
} from "@/src/lib/task-repository";
import { Task, TaskCreateInput, TaskUpdateInput, Status } from "@/src/lib/types";
import {
  validateTaskInput,
  validateTaskUpdateInput,
  validateStatus,
  ValidationError,
} from "@/src/lib/validation";
import { logError, logEvent } from "@/src/lib/logger";
import { trackTaskAction } from "@/src/lib/metrics";

export class TaskNotFoundError extends Error {
  constructor(id: string) {
    super(`Task not found: ${id}`);
    this.name = "TaskNotFoundError";
  }
}

export class TaskValidationError extends Error {
  public errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    const message = errors.length > 0 ? errors[0].message : "Validation failed.";
    super(message);
    this.name = "TaskValidationError";
    this.errors = errors;
  }
}

export async function createTask(input: TaskCreateInput): Promise<Task> {
  const validationResult = validateTaskInput(input as unknown as Record<string, unknown>);

  if (!validationResult.valid) {
    throw new TaskValidationError(validationResult.errors);
  }

  try {
    const task = await repoCreateTask(input);

    trackTaskAction("create", task.id);

    logEvent({
      taskId: task.id,
      action: "create",
      extra: {
        title: task.title,
        priority: task.priority,
        status: task.status,
      },
    });

    return task;
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), {
      component: "task-service",
      action: "createTask",
      extra: { title: input.title },
    });
    throw error;
  }
}

export async function getTask(id: string): Promise<Task> {
  try {
    const task = await getTaskById(id);

    if (!task) {
      throw new TaskNotFoundError(id);
    }

    return task;
  } catch (error) {
    if (error instanceof TaskNotFoundError) {
      throw error;
    }

    logError(error instanceof Error ? error : new Error(String(error)), {
      component: "task-service",
      action: "getTask",
      taskId: id,
    });
    throw error;
  }
}

export async function listTasks(params: ListTasksParams): Promise<ListTasksResult> {
  try {
    const result = await repoListTasks(params);
    return result;
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), {
      component: "task-service",
      action: "listTasks",
      extra: {
        page: params.page,
        pageSize: params.pageSize,
        query: params.query,
      },
    });
    throw error;
  }
}

export async function updateTask(id: string, input: TaskUpdateInput): Promise<Task> {
  const validationResult = validateTaskUpdateInput(input as unknown as Record<string, unknown>);

  if (!validationResult.valid) {
    throw new TaskValidationError(validationResult.errors);
  }

  try {
    const task = await repoUpdateTask(id, input);

    if (!task) {
      throw new TaskNotFoundError(id);
    }

    trackTaskAction("update", task.id);

    logEvent({
      taskId: task.id,
      action: "update",
      status: task.status,
      extra: {
        title: task.title,
        priority: task.priority,
      },
    });

    return task;
  } catch (error) {
    if (error instanceof TaskNotFoundError || error instanceof TaskValidationError) {
      throw error;
    }

    logError(error instanceof Error ? error : new Error(String(error)), {
      component: "task-service",
      action: "updateTask",
      taskId: id,
    });
    throw error;
  }
}

export async function deleteTask(id: string): Promise<void> {
  try {
    const deleted = await repoDeleteTask(id);

    if (!deleted) {
      throw new TaskNotFoundError(id);
    }

    trackTaskAction("delete", id);

    logEvent({
      taskId: id,
      action: "delete",
    });
  } catch (error) {
    if (error instanceof TaskNotFoundError) {
      throw error;
    }

    logError(error instanceof Error ? error : new Error(String(error)), {
      component: "task-service",
      action: "deleteTask",
      taskId: id,
    });
    throw error;
  }
}

export async function toggleTaskStatus(id: string, status: Status): Promise<Task> {
  const statusValidation = validateStatus(status);

  if (!statusValidation.valid) {
    throw new TaskValidationError(statusValidation.errors);
  }

  try {
    const task = await repoToggleTaskStatus(id, status);

    if (!task) {
      throw new TaskNotFoundError(id);
    }

    const action = status === Status.DONE ? "toggle_complete" : "toggle_incomplete";
    trackTaskAction(action, task.id);

    logEvent({
      taskId: task.id,
      action,
      status: task.status,
    });

    return task;
  } catch (error) {
    if (error instanceof TaskNotFoundError || error instanceof TaskValidationError) {
      throw error;
    }

    logError(error instanceof Error ? error : new Error(String(error)), {
      component: "task-service",
      action: "toggleTaskStatus",
      taskId: id,
      extra: { status },
    });
    throw error;
  }
}