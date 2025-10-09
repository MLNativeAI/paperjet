import Image from "next/image";
import Link from "next/link";
import { getBlogPosts } from "@/lib/blog-utils";
import { formatDate } from "@/lib/utils";

export function BlogPosts() {
  const allBlogs = getBlogPosts();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {allBlogs
        .sort((a, b) => {
          if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
            return -1;
          }
          return 1;
        })
        .map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
            <article className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              {post.metadata.image && (
                <div className="aspect-video w-full overflow-hidden">
                  <Image
                    src={post.metadata.image}
                    alt={post.metadata.title}
                    width={400}
                    height={225}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {post.metadata.author && (
                    <>
                      <span>By {post.metadata.author}</span>
                      <span>•</span>
                    </>
                  )}
                  <time>{formatDate(post.metadata.publishedAt, false)}</time>
                </div>
                <h3 className="mt-2 text-xl font-semibold text-gray-800 dark:text-gray-100 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {post.metadata.title}
                </h3>
                {post.metadata.summary && (
                  <p className="mt-3 text-gray-500 dark:text-gray-400 text-sm line-clamp-2">{post.metadata.summary}</p>
                )}
                <div className="mt-4 flex items-center text-gray-600 dark:text-gray-400 text-sm font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Read more
                  <svg
                    className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </article>
          </Link>
        ))}
    </div>
  );
}
