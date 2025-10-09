"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold">Something went wrong!</h1>
      <p className="mt-4 text-gray-600">We apologize for the inconvenience.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
