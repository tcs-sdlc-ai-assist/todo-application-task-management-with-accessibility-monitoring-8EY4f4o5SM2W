"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Task, Status } from "@/src/lib/types";
import { TaskItem } from "@/src/components/TaskItem";
import { LoadingSpinner } from "@/src/components/LoadingSpinner";
import { useTasks, UseTasksReturn } from "@/src/hooks/useTasks";

interface TaskListProps {
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleStatus: (id: string, status: Status) => Promise<void>;
  refreshKey?: number;
}

const DEBOUNCE_DELAY_MS = 300;

export function TaskList({
  onEdit,
  onDelete,
  onToggleStatus,
  refreshKey,
}: TaskListProps) {
  const {
    tasks,
    loading,
    error,
    page,
    totalPages,
    total,
    query,
    searchTasks,
    changePage,
    refreshTasks,
  }: UseTasksReturn = useTasks();

  const [searchInput, setSearchInput] = useState<string>(query);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousRefreshKeyRef = useRef<number | undefined>(refreshKey);

  useEffect(() => {
    if (
      refreshKey !== undefined &&
      previousRefreshKeyRef.current !== undefined &&
      refreshKey !== previousRefreshKeyRef.current
    ) {
      refreshTasks();
    }
    previousRefreshKeyRef.current = refreshKey;
  }, [refreshKey, refreshTasks]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchInput(value);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        searchTasks(value);
      }, DEBOUNCE_DELAY_MS);
    },
    [searchTasks]
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handlePreviousPage = useCallback(() => {
    changePage(page - 1);
  }, [changePage, page]);

  const handleNextPage = useCallback(() => {
    changePage(page + 1);
  }, [changePage, page]);

  const handlePageClick = useCallback(
    (pageNumber: number) => {
      changePage(pageNumber);
    },
    [changePage]
  );

  const renderPageNumbers = useCallback(() => {
    const pages: React.ReactNode[] = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      const isCurrent = i === page;
      pages.push(
        <button
          key={i}
          type="button"
          className={`btn text-xs px-3 py-1 ${isCurrent ? "btn-primary" : ""}`}
          onClick={() => handlePageClick(i)}
          aria-label={`Page ${i}`}
          aria-current={isCurrent ? "page" : undefined}
          disabled={isCurrent}
        >
          {i}
        </button>
      );
    }

    return pages;
  }, [page, totalPages, handlePageClick]);

  return (
    <div className="flex flex-col gap-4">
      <div role="search" aria-label="Search tasks">
        <label htmlFor="task-search" className="label">
          Search tasks
        </label>
        <input
          id="task-search"
          type="search"
          className="input"
          value={searchInput}
          onChange={handleSearchChange}
          placeholder="Search by title or description…"
          autoComplete="off"
          aria-label="Search tasks by title or description"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" label="Loading tasks" />
        </div>
      )}

      {error && !loading && (
        <div
          role="alert"
          className="card flex flex-col items-center justify-center gap-4 p-8 text-center"
        >
          <h2 className="text-lg font-bold text-hc-fg">
            Failed to load tasks
          </h2>
          <p className="error-text">{error}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={refreshTasks}
            aria-label="Retry loading tasks"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && tasks.length === 0 && (
        <div className="card flex flex-col items-center justify-center gap-2 p-8 text-center">
          <p className="text-sm text-hc-fg opacity-70">
            {query
              ? `No tasks found matching "${query}".`
              : "No tasks yet. Create your first task to get started."}
          </p>
        </div>
      )}

      {!loading && !error && tasks.length > 0 && (
        <>
          <p className="text-sm text-hc-fg opacity-70" aria-live="polite">
            {total} {total === 1 ? "task" : "tasks"} found
            {query ? ` for "${query}"` : ""}
          </p>

          <ul role="list" aria-label="Task list" className="flex flex-col gap-3">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleStatus={onToggleStatus}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </ul>

          {totalPages > 1 && (
            <nav
              aria-label="Task list pagination"
              className="flex items-center justify-center gap-2 pt-4"
            >
              <button
                type="button"
                className="btn text-xs px-3 py-1"
                onClick={handlePreviousPage}
                disabled={page <= 1}
                aria-label="Go to previous page"
              >
                Previous
              </button>

              {renderPageNumbers()}

              <button
                type="button"
                className="btn text-xs px-3 py-1"
                onClick={handleNextPage}
                disabled={page >= totalPages}
                aria-label="Go to next page"
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}