"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-xl font-semibold text-red-600 mb-2">
        Произошла ошибка
      </h1>
      <pre className="text-sm text-gray-700 bg-white p-4 rounded border overflow-auto max-w-full mb-4">
        {error.message}
      </pre>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Попробовать снова
      </button>
    </div>
  );
}
