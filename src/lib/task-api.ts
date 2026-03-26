import {
  Task,
  TaskCreateInput,
  TaskUpdateInput,
  TaskListParams,
  TaskListResponse,
  ApiErrorResponse,
} from "@/src/lib/types";

const API_BASE = "/api/tasks";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body: ApiErrorResponse = await response.json().catch(() => ({
      error: `Request failed with status ${response.status}.`,
    }));

    throw new Error(body.error || `Request failed with status ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

export async function fetchTasks(params?: TaskListParams): Promise<TaskListResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params?.pageSize !== undefined) {
    searchParams.set("pageSize", String(params.pageSize));
  }

  if (params?.query !== undefined && params.query.trim().length > 0) {
    searchParams.set("query", params.query.trim());
  }

  const queryString = searchParams.toString();
  const url = queryString ? `${API_BASE}?${queryString}` : API_BASE;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  return handleResponse<TaskListResponse>(response);
}

export async function fetchTask(id: string): Promise<Task> {
  const response = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  return handleResponse<Task>(response);
}

export async function createTask(data: TaskCreateInput): Promise<Task> {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<Task>(response);
}

export async function updateTask(id: string, data: TaskUpdateInput): Promise<Task> {
  const response = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<Task>(response);
}

export async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    const body: ApiErrorResponse = await response.json().catch(() => ({
      error: `Request failed with status ${response.status}.`,
    }));

    throw new Error(body.error || `Request failed with status ${response.status}.`);
  }
}

export async function toggleTaskStatus(id: string): Promise<Task> {
  const response = await fetch(`${API_BASE}/${encodeURIComponent(id)}/toggle`, {
    method: "PATCH",
    headers: {
      "Accept": "application/json",
    },
  });

  return handleResponse<Task>(response);
}