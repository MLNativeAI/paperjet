import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-6xl font-bold">404</h1>
      <h2 className="text-2xl mt-4">Page Not Found</h2>
      <p className="mt-4 text-gray-600">The page you're looking for doesn't exist.</p>
      <Link href="/" className="mt-6 px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors">
        Go Home
      </Link>
    </div>
  );
}
