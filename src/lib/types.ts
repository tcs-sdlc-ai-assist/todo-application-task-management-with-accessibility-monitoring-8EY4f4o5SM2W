import { Priority, Status } from "@prisma/client";

export { Priority, Status };

export interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  priority: Priority | null;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskCreateInput {
  title: string;
  description?: string | null;
  dueDate?: Date | string | null;
  priority?: Priority | null;
  status?: Status;
}

export interface TaskUpdateInput {
  title?: string;
  description?: string | null;
  dueDate?: Date | string | null;
  priority?: Priority | null;
  status?: Status;
}

export interface TaskListParams {
  page?: number;
  pageSize?: number;
  query?: string;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiErrorResponse {
  error: string;
  details?: Record<string, string[]>;
}

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}