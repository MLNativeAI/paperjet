import { BlogPosts } from "@/components/blog-posts";

export const metadata = {
  title: "Blog",
  description: "Read our blog about document processing and AI workflows.",
};

export default function Page() {
  return (
    <section className="container min-h-[300px]">
      <h3 className="mb-4 text-lg text-muted-foreground">Blog</h3>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-12">Latest news</h2>
      <BlogPosts />
    </section>
  );
}
