import { NextRequest } from "next/server";
import {
  sendSuccess,
  sendValidationError,
  sendError,
  parseQueryParams,
  withMiddleware,
} from "@/src/lib/api-helpers";
import {
  createTask,
  listTasks,
  TaskValidationError,
} from "@/src/lib/task-service";
import { TaskCreateInput } from "@/src/lib/types";

async function handleGET(request: NextRequest) {
  const { page, pageSize, query } = parseQueryParams(request);

  const result = await listTasks({ page, pageSize, query });

  return sendSuccess({
    tasks: result.tasks,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    totalPages: result.totalPages,
  });
}

async function handlePOST(request: NextRequest) {
  let body: TaskCreateInput;

  try {
    body = await request.json();
  } catch {
    return sendError("Invalid JSON in request body.", 400);
  }

  try {
    const task = await createTask(body);
    return sendSuccess(task, 201);
  } catch (error) {
    if (error instanceof TaskValidationError) {
      return sendValidationError(error.errors);
    }
    throw error;
  }
}

const GET = withMiddleware(async (request: NextRequest) => {
  return handleGET(request);
});

const POST = withMiddleware(async (request: NextRequest) => {
  return handlePOST(request);
});

export { GET, POST };