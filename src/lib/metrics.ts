import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/src/lib/db";
import { Status } from "@/src/lib/types";

export interface MetricsSnapshot {
  task_completion_rate: number;
  api_response_time_ms: number;
  error_rate: number;
  active_users: number;
  window: string;
}

interface InMemoryCounters {
  taskCompleted: number;
  taskCreated: number;
  taskDeleted: number;
  taskUpdated: number;
  apiResponseTimes: number[];
  errorCount: number;
  requestCount: number;
}

const counters: InMemoryCounters = {
  taskCompleted: 0,
  taskCreated: 0,
  taskDeleted: 0,
  taskUpdated: 0,
  apiResponseTimes: [],
  errorCount: 0,
  requestCount: 0,
};

export type TaskMetricAction =
  | "create"
  | "update"
  | "delete"
  | "toggle_complete"
  | "toggle_incomplete";

export function trackTaskAction(
  action: TaskMetricAction,
  taskId?: string
): void {
  switch (action) {
    case "create":
      counters.taskCreated++;
      break;
    case "update":
      counters.taskUpdated++;
      break;
    case "delete":
      counters.taskDeleted++;
      break;
    case "toggle_complete":
      counters.taskCompleted++;
      break;
    case "toggle_incomplete":
      break;
  }

  Sentry.addBreadcrumb({
    category: "metrics",
    message: `Task metric: ${action}`,
    level: "info",
    data: {
      action,
      ...(taskId ? { taskId } : {}),
    },
  });
}

export function trackApiResponse(
  endpoint: string,
  method: string,
  statusCode: number,
  responseTimeMs: number
): void {
  counters.requestCount++;
  counters.apiResponseTimes.push(responseTimeMs);

  if (statusCode >= 500) {
    counters.errorCount++;
  }

  Sentry.addBreadcrumb({
    category: "metrics",
    message: `API ${method} ${endpoint} ${statusCode} ${responseTimeMs}ms`,
    level: statusCode >= 500 ? "error" : statusCode >= 400 ? "warning" : "info",
    data: {
      endpoint,
      method,
      statusCode,
      responseTimeMs,
    },
  });
}

function calculateAverageResponseTime(): number {
  const times = counters.apiResponseTimes;
  if (times.length === 0) {
    return 0;
  }
  const sum = times.reduce((acc, val) => acc + val, 0);
  return Math.round(sum / times.length);
}

function calculateErrorRate(): number {
  if (counters.requestCount === 0) {
    return 0;
  }
  return parseFloat((counters.errorCount / counters.requestCount).toFixed(4));
}

export async function getMetricsSummary(): Promise<MetricsSnapshot> {
  const today = new Date().toISOString().split("T")[0];

  let taskCompletionRate = 0;

  try {
    const totalTasks = await prisma.task.count();
    const completedTasks = await prisma.task.count({
      where: { status: Status.DONE },
    });

    taskCompletionRate =
      totalTasks > 0
        ? parseFloat((completedTasks / totalTasks).toFixed(4))
        : 0;
  } catch {
    taskCompletionRate = 0;
  }

  const avgResponseTime = calculateAverageResponseTime();
  const errorRate = calculateErrorRate();

  return {
    task_completion_rate: taskCompletionRate,
    api_response_time_ms: avgResponseTime,
    error_rate: errorRate,
    active_users: 1,
    window: today,
  };
}

export function resetCounters(): void {
  counters.taskCompleted = 0;
  counters.taskCreated = 0;
  counters.taskDeleted = 0;
  counters.taskUpdated = 0;
  counters.apiResponseTimes = [];
  counters.errorCount = 0;
  counters.requestCount = 0;
}