"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

import "highlight.js/styles/github-dark.css";

type Props = {
  content: string;
};

export default function MarkdownRenderer({ content }: Props) {
  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code({ className, children, ...props }) {
            const isBlock = className?.startsWith("language-");

            if (!isBlock) {
              return (
                <code className="bg-muted px-1 py-0.5 rounded text-sm">
                  {children}
                </code>
              );
            }

            return (
              <pre className="rounded-lg overflow-x-auto">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
