import { useState, useEffect, useCallback, useRef } from "react";
import { Task, TaskListResponse } from "@/src/lib/types";
import { fetchTasks } from "@/src/lib/task-api";

export interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  query: string;
  loadTasks: () => Promise<void>;
  searchTasks: (query: string) => void;
  changePage: (page: number) => void;
  refreshTasks: () => Promise<void>;
}

const DEFAULT_PAGE_SIZE = 20;

export function useTasks(initialPageSize?: number): UseTasksReturn {
  const pageSize = initialPageSize ?? DEFAULT_PAGE_SIZE;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [query, setQuery] = useState<string>("");

  const abortControllerRef = useRef<AbortController | null>(null);

  const loadTasks = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response: TaskListResponse = await fetchTasks({
        page,
        pageSize,
        query,
      });

      setTasks(response.tasks);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }

      const message =
        err instanceof Error ? err.message : "Failed to load tasks.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, query]);

  const searchTasks = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setPage(1);
  }, []);

  const changePage = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalPages) {
        return;
      }
      setPage(newPage);
    },
    [totalPages]
  );

  const refreshTasks = useCallback(async () => {
    await loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    loadTasks();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadTasks]);

  return {
    tasks,
    loading,
    error,
    page,
    totalPages,
    total,
    pageSize,
    query,
    loadTasks,
    searchTasks,
    changePage,
    refreshTasks,
  };
}