import * as Sentry from "@sentry/nextjs";

export interface ErrorContext {
  component?: string;
  action?: string;
  taskId?: string;
  extra?: Record<string, unknown>;
}

export interface TaskEventContext {
  taskId?: string;
  action: string;
  status?: string;
  extra?: Record<string, unknown>;
}

export interface ApiMetric {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTimeMs: number;
  extra?: Record<string, unknown>;
}

function sanitizeContext(
  context: Record<string, unknown>
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  const piiKeys = [
    "email",
    "password",
    "token",
    "secret",
    "authorization",
    "cookie",
    "ssn",
    "phone",
    "address",
    "creditcard",
    "credit_card",
  ];

  for (const [key, value] of Object.entries(context)) {
    const lowerKey = key.toLowerCase();
    if (piiKeys.some((pii) => lowerKey.includes(pii))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null && !(value instanceof Date)) {
      sanitized[key] = sanitizeContext(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export function logError(error: Error, context?: ErrorContext): void {
  const sanitizedExtra = context?.extra
    ? sanitizeContext(context.extra)
    : undefined;

  Sentry.withScope((scope) => {
    if (context?.component) {
      scope.setTag("component", context.component);
    }

    if (context?.action) {
      scope.setTag("action", context.action);
    }

    if (context?.taskId) {
      scope.setTag("taskId", context.taskId);
    }

    if (sanitizedExtra) {
      scope.setExtras(sanitizedExtra);
    }

    Sentry.captureException(error);
  });
}

export function logEvent(context: TaskEventContext): void {
  const sanitizedExtra = context.extra
    ? sanitizeContext(context.extra)
    : undefined;

  Sentry.addBreadcrumb({
    category: "task",
    message: `Task action: ${context.action}`,
    level: "info",
    data: {
      ...(context.taskId ? { taskId: context.taskId } : {}),
      action: context.action,
      ...(context.status ? { status: context.status } : {}),
      ...sanitizedExtra,
    },
  });

  Sentry.captureEvent({
    message: `Task action: ${context.action}`,
    level: "info",
    tags: {
      action: context.action,
      ...(context.taskId ? { taskId: context.taskId } : {}),
      ...(context.status ? { status: context.status } : {}),
    },
    extra: sanitizedExtra,
  });
}

export function logApiMetric(metric: ApiMetric): void {
  const sanitizedExtra = metric.extra
    ? sanitizeContext(metric.extra)
    : undefined;

  const level: Sentry.SeverityLevel =
    metric.statusCode >= 500
      ? "error"
      : metric.statusCode >= 400
        ? "warning"
        : "info";

  Sentry.addBreadcrumb({
    category: "api",
    message: `${metric.method} ${metric.endpoint} ${metric.statusCode} ${metric.responseTimeMs}ms`,
    level,
    data: {
      endpoint: metric.endpoint,
      method: metric.method,
      statusCode: metric.statusCode,
      responseTimeMs: metric.responseTimeMs,
      ...sanitizedExtra,
    },
  });

  if (metric.statusCode >= 400 || metric.responseTimeMs > 300) {
    Sentry.captureEvent({
      message: `API ${metric.method} ${metric.endpoint} - ${metric.statusCode} (${metric.responseTimeMs}ms)`,
      level,
      tags: {
        endpoint: metric.endpoint,
        method: metric.method,
        statusCode: String(metric.statusCode),
      },
      extra: {
        responseTimeMs: metric.responseTimeMs,
        ...sanitizedExtra,
      },
    });
  }
}