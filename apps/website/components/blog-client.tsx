"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { formatDate } from "@/lib/utils";

type BlogPost = {
  metadata: {
    title: string;
    publishedAt: string;
    summary: string;
    image?: string;
    author?: string;
  };
  slug: string;
  content: string;
};

type BlogClientProps = {
  posts: BlogPost[];
};

export const BlogClient = ({ posts }: BlogClientProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate");
          }
        });
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) {
      const animatedElements = sectionRef.current.querySelectorAll(".animate-on-scroll");
      // biome-ignore lint/suspicious/useIterableCallbackReturn: Because I said so
      animatedElements.forEach((element) => observer.observe(element));
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="blog" ref={sectionRef} className="pt-16 pb-40">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Blog</h2>
          <p className="max-w-[800px] text-muted-foreground md:text-lg">Latest news</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block animate-on-scroll"
              style={{ animationDelay: `${index * 100}ms` }}
            >
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
                    <p className="mt-3 text-gray-500 dark:text-gray-400 text-sm line-clamp-2">
                      {post.metadata.summary}
                    </p>
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

        <div className="mt-12 text-center animate-on-scroll">
          <Link
            href="/blog"
            className="inline-flex items-center text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
          >
            View all posts
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
