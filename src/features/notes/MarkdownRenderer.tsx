import React from 'react';
import Markdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  searchQuery?: string;
  className?: string;
  compact?: boolean;
}

const highlightText = (text: string, query?: string): React.ReactNode => {
  if (!query || !query.trim()) return text;
  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-cyan-500/30 text-cyan-100 px-0.5 rounded font-medium">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

const processChildren = (children: React.ReactNode, query?: string): React.ReactNode => {
  if (!query || !query.trim()) return children;
  return React.Children.map(children, (child) => {
    if (typeof child === 'string') {
      return highlightText(child, query);
    }
    if (React.isValidElement(child)) {
      const childProps = child.props as { children?: React.ReactNode };
      if (childProps && childProps.children) {
        return React.cloneElement(child, {
          ...childProps,
          children: processChildren(childProps.children, query),
        } as any);
      }
    }
    return child;
  });
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  searchQuery,
  className = '',
  compact = false,
}) => {
  if (!content || !content.trim()) {
    return <span className="text-slate-500 italic text-xs">No content provided</span>;
  }

  return (
    <div className={`markdown-body text-xs text-slate-300 leading-relaxed ${className}`}>
      <Markdown
        components={{
          h1: ({ children }) => (
            <h3 className="text-sm sm:text-base font-bold text-white mt-2.5 mb-1.5 pb-1 border-b border-white/[0.08] tracking-tight">
              {processChildren(children, searchQuery)}
            </h3>
          ),
          h2: ({ children }) => (
            <h4 className="text-xs sm:text-sm font-bold text-cyan-300 mt-2 mb-1">
              {processChildren(children, searchQuery)}
            </h4>
          ),
          h3: ({ children }) => (
            <h5 className="text-xs font-semibold text-slate-100 mt-1.5 mb-0.5">
              {processChildren(children, searchQuery)}
            </h5>
          ),
          p: ({ children }) => (
            <p className={`${compact ? 'mb-1.5' : 'mb-2'} last:mb-0 leading-relaxed`}>
              {processChildren(children, searchQuery)}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-white tracking-wide">
              {processChildren(children, searchQuery)}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-cyan-200/90">
              {processChildren(children, searchQuery)}
            </em>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-4 space-y-1 my-1.5 marker:text-cyan-400">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-4 space-y-1 my-1.5 marker:text-cyan-400 marker:font-mono marker:text-[10px]">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">
              {processChildren(children, searchQuery)}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-cyan-500/50 pl-2.5 py-0.5 my-1.5 bg-cyan-950/20 rounded-r text-slate-300 italic">
              {processChildren(children, searchQuery)}
            </blockquote>
          ),
          code: ({ children, className: codeClassName }) => {
            const isBlock = codeClassName?.includes('language-');
            if (isBlock) {
              return (
                <pre className="my-2 p-2.5 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                  <code>{children}</code>
                </pre>
              );
            }
            return (
              <code className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 font-mono text-[11px] text-cyan-300">
                {children}
              </code>
            );
          },
          hr: () => <hr className="border-white/10 my-3" />,
        }}
      >
        {content}
      </Markdown>
    </div>
  );
};
