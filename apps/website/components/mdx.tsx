import Image from "next/image";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import React from "react";
import { highlight } from "sugar-high";

interface TableData {
  headers: string[];
  rows: string[][];
}

function Table({ data }: { data: TableData }) {
  const headers = data.headers.map((header: string) => (
    <th
      key={header}
      className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600"
    >
      {header}
    </th>
  ));
  const rows = data.rows.map((row: string[], rowIndex: number) => (
    <tr key={`row-${row.join("-").slice(0, 50)}-${rowIndex}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
      {row.map((cell: string, cellIndex: number) => (
        <td
          key={`${data.headers[cellIndex] || `col-${cellIndex}`}-${rowIndex}`}
          className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
        >
          {cell}
        </td>
      ))}
    </tr>
  ));

  return (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 rounded-lg">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>{headers}</tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

interface CustomLinkProps {
  href: string;
  children: React.ReactNode;
}

function CustomLink({ href, children, ...props }: CustomLinkProps & Record<string, unknown>) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }

  if (href.startsWith("#")) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
}

function Code({ children, ...props }: { children: React.ReactNode }) {
  const codeHTML = highlight(children as string);
  // biome-ignore lint/security/noDangerouslySetInnerHtml: We need this for mdx
  return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />;
}

function slugify(str: string) {
  return str
    .toString()
    .toLowerCase()
    .trim() // Remove whitespace from both ends of a string
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w-]+/g, "") // Remove all non-word characters except for -
    .replace(/--+/g, "-"); // Replace multiple - with single -
}

function createHeading(level: number) {
  const Heading = ({ children }: { children: React.ReactNode }) => {
    const slug = slugify(children as string);
    return React.createElement(
      `h${level}`,
      { id: slug },
      [
        React.createElement("a", {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: "anchor",
        }),
      ],
      children,
    );
  };

  Heading.displayName = `Heading${level}`;

  return Heading;
}

function YouTube({ id }: { id: string }) {
  return (
    <div className="relative w-full h-0 pb-[56.25%] my-6">
      <iframe
        className="absolute top-0 left-0 w-full h-full rounded-lg"
        src={`https://www.youtube.com/embed/${id}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}

function Quote({ children, author, title }: { children: React.ReactNode; author?: string; title?: string }) {
  return (
    <div className="my-8 relative">
      <div className="border-l-4 border-gray-300 pl-6 py-4 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-600 rounded-r-lg">
        <div className="relative">
          <svg
            className="absolute -top-2 -left-2 w-8 h-8 text-gray-400 dark:text-gray-500"
            fill="currentColor"
            viewBox="0 0 32 32"
            aria-hidden="true"
          >
            <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
          </svg>
          <div className="text-lg text-gray-700 dark:text-gray-300 italic leading-relaxed pl-6">{children}</div>
          {(author || title) && (
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 font-medium pl-6">
              — {author}
              {title && `, ${title}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 relative">
      <div className="border-l-4 border-blue-500 pl-6 py-3 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400 rounded-r-lg">
        <div className="relative">
          <svg
            className="absolute top-0 -left-2 w-6 h-6 text-blue-500 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-base text-gray-800 dark:text-gray-200 font-medium leading-relaxed pl-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

function RoundedImage(props: { src: string; alt?: string; [key: string]: unknown }) {
  return <Image {...props} alt={props.alt || ""} className="rounded-lg" />;
}

function Strong({ children }: { children: React.ReactNode }) {
  return <strong className="font-bold text-gray-900 dark:text-gray-100">{children}</strong>;
}

const components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  Image: RoundedImage,
  a: CustomLink,
  code: Code,
  strong: Strong,
  Table,
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600" {...props} />
    </div>
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-gray-50 dark:bg-gray-800" {...props} />
  ),
  tbody: (props: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody {...props} />,
  tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr
      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
      {...props}
    />
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 border-r border-gray-300 dark:border-gray-600 last:border-r-0"
      {...props}
    />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600 last:border-r-0"
      {...props}
    />
  ),
  YouTube,
  Quote,
  Highlight,
};

export function CustomMDX({
  source,
  ...props
}: {
  source: string;
  components?: Record<string, React.ComponentType>;
} & Record<string, unknown>) {
  return <MDXRemote source={source} {...props} components={{ ...components, ...(props.components || {}) }} />;
}
