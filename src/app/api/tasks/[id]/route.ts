import { NextRequest } from "next/server";
import {
  sendSuccess,
  sendValidationError,
  sendNotFound,
  sendError,
  withMiddleware,
} from "@/src/lib/api-helpers";
import {
  getTask,
  updateTask,
  deleteTask,
  TaskNotFoundError,
  TaskValidationError,
} from "@/src/lib/task-service";
import { TaskUpdateInput } from "@/src/lib/types";

async function handleGET(
  _request: NextRequest,
  context: { params: Record<string, string> }
) {
  const { id } = context.params;

  if (!id || id.trim().length === 0) {
    return sendError("Task ID is required.", 400);
  }

  try {
    const task = await getTask(id);
    return sendSuccess(task);
  } catch (error) {
    if (error instanceof TaskNotFoundError) {
      return sendNotFound();
    }
    throw error;
  }
}

async function handlePUT(
  request: NextRequest,
  context: { params: Record<string, string> }
) {
  const { id } = context.params;

  if (!id || id.trim().length === 0) {
    return sendError("Task ID is required.", 400);
  }

  let body: TaskUpdateInput;

  try {
    body = await request.json();
  } catch {
    return sendError("Invalid JSON in request body.", 400);
  }

  try {
    const task = await updateTask(id, body);
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

async function handleDELETE(
  _request: NextRequest,
  context: { params: Record<string, string> }
) {
  const { id } = context.params;

  if (!id || id.trim().length === 0) {
    return sendError("Task ID is required.", 400);
  }

  try {
    await deleteTask(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof TaskNotFoundError) {
      return sendNotFound();
    }
    throw error;
  }
}

const GET = withMiddleware(async (request: NextRequest, context?: { params: Record<string, string> }) => {
  return handleGET(request, context!);
});

const PUT = withMiddleware(async (request: NextRequest, context?: { params: Record<string, string> }) => {
  return handlePUT(request, context!);
});

const DELETE = withMiddleware(async (request: NextRequest, context?: { params: Record<string, string> }) => {
  return handleDELETE(request, context!);
});

export { GET, PUT, DELETE };