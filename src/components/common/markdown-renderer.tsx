'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils/cn';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        'prose prose-sm md:prose-base dark:prose-invert max-w-none',
        'prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-gray-100',
        'prose-a:text-primary-600 dark:prose-a:text-primary-400',
        'prose-code:bg-gray-100 prose-code:dark:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm',
        'prose-pre:bg-gray-100 prose-pre:dark:bg-gray-800 prose-pre:rounded-lg',
        'prose-img:rounded-lg prose-img:border prose-img:border-gray-200 dark:prose-img:border-gray-700',
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
