// components/Loading.tsx
"use client";

import { cn } from "@/lib/utils";

interface LoadingProps {
  variant?: "spinner" | "calendar" | "table";
  className?: string;
  rows?: number; // For table variant
}

export default function Loading({ variant = "spinner", className, rows = 5 }: LoadingProps) {
  if (variant === "calendar") {
    // Skeleton for calendar grid (7 columns x 6 rows)
    return (
      <div className={cn("flex flex-col space-y-2", className)}>
        {/* Header (day names) */}
        <div className="flex w-full">
          {Array(7)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="flex-1 h-8 m-[2px] bg-gray-200 rounded-md animate-pulse"
              />
            ))}
        </div>
        {/* Calendar grid */}
        {Array(6)
          .fill(0)
          .map((_, row) => (
            <div key={row} className="flex w-full">
              {Array(7)
                .fill(0)
                .map((_, col) => (
                  <div
                    key={`${row}-${col}`}
                    className="flex-1 h-24 m-[2px] bg-gray-200 rounded-md animate-pulse"
                  />
                ))}
            </div>
          ))}
      </div>
    );
  }

  if (variant === "table") {
    // Skeleton for table rows
    return (
      <div className={cn("space-y-2", className)}>
        {Array(rows)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded-md animate-pulse" />
          ))}
      </div>
    );
  }

  // Default spinner
  return (
    <div className={cn("flex items-center justify-center h-full", className)}>
      <svg
        className="h-8 w-8 animate-spin text-blue-500"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}