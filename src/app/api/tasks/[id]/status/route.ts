import { NextRequest } from "next/server";
import {
  sendSuccess,
  sendValidationError,
  sendNotFound,
  sendError,
  withMiddleware,
} from "@/src/lib/api-helpers";
import {
  toggleTaskStatus,
  TaskNotFoundError,
  TaskValidationError,
} from "@/src/lib/task-service";
import { Status } from "@/src/lib/types";

async function handlePATCH(
  request: NextRequest,
  context: { params: Record<string, string> }
) {
  const { id } = context.params;

  if (!id || id.trim().length === 0) {
    return sendError("Task ID is required.", 400);
  }

  let body: { status?: Status };

  try {
    body = await request.json();
  } catch {
    return sendError("Invalid JSON in request body.", 400);
  }

  if (!body.status) {
    return sendError("Status is required.", 400);
  }

  try {
    const task = await toggleTaskStatus(id, body.status);
    return sendSuccess(task);
  } catch (error) {
    if (error instanceof TaskValidationError) {
      return sendValidationError(error.errors);
    }
    if (error instanceof TaskNotFoundError) {
      return sendNotFound();
    }
    throw error;
  }
}

const PATCH = withMiddleware(async (request: NextRequest, context?: { params: Record<string, string> }) => {
  return handlePATCH(request, context!);
});

export { PATCH };