import { NextRequest, NextResponse } from "next/server";
import { rateLimitMiddleware } from "@/src/lib/rate-limit";
import { logError, logApiMetric } from "@/src/lib/logger";
import { trackApiResponse } from "@/src/lib/metrics";
import { ApiErrorResponse } from "@/src/lib/types";
import { ValidationError, formatValidationErrors } from "@/src/lib/validation";

type ApiHandler = (
  request: NextRequest,
  context?: { params: Record<string, string> }
) => Promise<NextResponse>;

export function sendSuccess<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function sendError(
  error: string,
  status: number = 500,
  details?: Record<string, string[]>
): NextResponse {
  const body: ApiErrorResponse = { error };
  if (details) {
    body.details = details;
  }
  return NextResponse.json(body, { status });
}

export function sendValidationError(errors: ValidationError[]): NextResponse {
  const grouped = formatValidationErrors(errors);
  const firstMessage = errors.length > 0 ? errors[0].message : "Validation failed.";
  return sendError(firstMessage, 400, grouped);
}

export function sendNotFound(message: string = "Task not found."): NextResponse {
  return sendError(message, 404);
}

export function parseQueryParams(request: NextRequest): {
  page: number;
  pageSize: number;
  query: string;
} {
  const searchParams = request.nextUrl.searchParams;

  const pageParam = searchParams.get("page");
  const pageSizeParam = searchParams.get("pageSize");
  const queryParam = searchParams.get("query");

  let page = 1;
  if (pageParam) {
    const parsed = parseInt(pageParam, 10);
    if (!isNaN(parsed) && parsed > 0) {
      page = parsed;
    }
  }

  let pageSize = 20;
  if (pageSizeParam) {
    const parsed = parseInt(pageSizeParam, 10);
    if (!isNaN(parsed) && parsed > 0) {
      pageSize = Math.min(parsed, 100);
    }
  }

  const query = queryParam?.trim() ?? "";

  return { page, pageSize, query };
}

export function withErrorHandling(handler: ApiHandler): ApiHandler {
  return async (
    request: NextRequest,
    context?: { params: Record<string, string> }
  ): Promise<NextResponse> => {
    const startTime = Date.now();
    const endpoint = request.nextUrl.pathname;
    const method = request.method;

    try {
      const response = await handler(request, context);

      const responseTimeMs = Date.now() - startTime;
      const statusCode = response.status;

      trackApiResponse(endpoint, method, statusCode, responseTimeMs);
      logApiMetric({
        endpoint,
        method,
        statusCode,
        responseTimeMs,
      });

      return response;
    } catch (error) {
      const responseTimeMs = Date.now() - startTime;

      logError(error instanceof Error ? error : new Error(String(error)), {
        component: "api",
        action: `${method} ${endpoint}`,
        extra: { responseTimeMs },
      });

      trackApiResponse(endpoint, method, 500, responseTimeMs);
      logApiMetric({
        endpoint,
        method,
        statusCode: 500,
        responseTimeMs,
      });

      return sendError("Internal server error.", 500);
    }
  };
}

export function withRateLimit(
  handler: ApiHandler,
  config?: { maxTokens?: number; refillRate?: number; refillIntervalMs?: number }
): ApiHandler {
  return async (
    request: NextRequest,
    context?: { params: Record<string, string> }
  ): Promise<NextResponse> => {
    const rateLimitResponse = rateLimitMiddleware(request, config);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return handler(request, context);
  };
}

export function withMiddleware(
  handler: ApiHandler,
  options?: {
    rateLimit?: { maxTokens?: number; refillRate?: number; refillIntervalMs?: number };
  }
): ApiHandler {
  let wrapped = handler;
  wrapped = withErrorHandling(wrapped);
  wrapped = withRateLimit(wrapped, options?.rateLimit);
  return wrapped;
}