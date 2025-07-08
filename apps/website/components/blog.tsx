import { BlogClient } from "@/components/blog-client";
import { getBlogPosts } from "@/lib/blog-utils";

const Blog = () => {
  // Get the 3 latest blog posts (server-side)
  const allBlogs = getBlogPosts();
  const latestPosts = allBlogs
    .sort((a, b) => {
      if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
        return -1;
      }
      return 1;
    })
    .slice(0, 3);

  return <BlogClient posts={latestPosts} />;
};

export default Blog;
