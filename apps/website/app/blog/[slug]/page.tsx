import Image from "next/image";
import { notFound } from "next/navigation";
import { CustomMDX } from "@/components/mdx";
import { getBlogPosts } from "@/lib/blog-utils";
import { formatDate } from "@/lib/utils";

export async function generateStaticParams() {
  const posts = getBlogPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPosts().find((post) => post.slug === slug);
  if (!post) {
    return;
  }

  const { title, publishedAt: publishedTime, summary: description, image } = post.metadata;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      url: `/blog/${post.slug}`,
      images: image ? [{ url: image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function Blog({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPosts().find((post) => post.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <section className="max-w-3xl mx-auto px-4">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        // biome-ignore lint/security/noDangerouslySetInnerHtml: We need this for mdx
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            image: post.metadata.image || undefined,
            url: `/blog/${post.slug}`,
            author: {
              "@type": "Person",
              name: post.metadata.author || "PaperJet",
            },
          }),
        }}
      />
      <h1 className="title font-semibold text-2xl tracking-tighter">{post.metadata.title}</h1>
      <div className="flex justify-between items-center mt-2 mb-8 text-sm">
        <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
          {post.metadata.author && (
            <>
              <span>By {post.metadata.author}</span>
              <span>•</span>
            </>
          )}
          <span>{formatDate(post.metadata.publishedAt)}</span>
        </div>
      </div>
      {post.metadata.summary && (
        <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-8 italic">{post.metadata.summary}</p>
      )}
      {post.metadata.image && (
        <div className="mb-6">
          <Image
            src={post.metadata.image}
            alt={post.metadata.title}
            width={800}
            height={400}
            className="w-full max-w-lg rounded-md"
          />
        </div>
      )}
      <article className="prose prose-lg dark:prose-invert max-w-none">
        <CustomMDX source={post.content} />
      </article>
    </section>
  );
}
