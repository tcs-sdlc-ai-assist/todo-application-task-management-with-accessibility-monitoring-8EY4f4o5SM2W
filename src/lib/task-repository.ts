import { Prisma } from "@prisma/client";
import { prisma } from "@/src/lib/db";
import { Task, TaskCreateInput, TaskUpdateInput, Status } from "@/src/lib/types";

export interface ListTasksParams {
  page: number;
  pageSize: number;
  query?: string;
}

export interface ListTasksResult {
  tasks: Task[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function createTask(input: TaskCreateInput): Promise<Task> {
  const data: Prisma.TaskCreateInput = {
    title: input.title.trim(),
    description: input.description?.trim() ?? null,
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
    priority: input.priority ?? null,
    status: input.status ?? Status.TODO,
  };

  const task = await prisma.task.create({ data });
  return task;
}

export async function getTaskById(id: string): Promise<Task | null> {
  const task = await prisma.task.findUnique({
    where: { id },
  });

  return task;
}

export async function listTasks(params: ListTasksParams): Promise<ListTasksResult> {
  const { page, pageSize, query } = params;
  const skip = (page - 1) * pageSize;

  const where: Prisma.TaskWhereInput = {};

  if (query && query.length > 0) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.task.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    tasks,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function updateTask(
  id: string,
  input: TaskUpdateInput
): Promise<Task | null> {
  const existing = await prisma.task.findUnique({ where: { id } });

  if (!existing) {
    return null;
  }

  const data: Prisma.TaskUpdateInput = {};

  if (input.title !== undefined) {
    data.title = input.title.trim();
  }

  if (input.description !== undefined) {
    data.description = input.description?.trim() ?? null;
  }

  if (input.dueDate !== undefined) {
    data.dueDate = input.dueDate ? new Date(input.dueDate) : null;
  }

  if (input.priority !== undefined) {
    data.priority = input.priority ?? null;
  }

  if (input.status !== undefined) {
    data.status = input.status;
  }

  const task = await prisma.task.update({
    where: { id },
    data,
  });

  return task;
}

export async function deleteTask(id: string): Promise<boolean> {
  const existing = await prisma.task.findUnique({ where: { id } });

  if (!existing) {
    return false;
  }

  await prisma.task.delete({ where: { id } });
  return true;
}

export async function toggleTaskStatus(
  id: string,
  status: Status
): Promise<Task | null> {
  const existing = await prisma.task.findUnique({ where: { id } });

  if (!existing) {
    return null;
  }

  const task = await prisma.task.update({
    where: { id },
    data: { status },
  });

  return task;
}