import React from "react";
import { LoadingSpinner } from "@/src/components/LoadingSpinner";

export default function Loading() {
  return (
    <div className="flex items-center justify-center py-12">
      <LoadingSpinner size="lg" label="Loading page" />
    </div>
  );
}