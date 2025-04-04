import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface MarkdownRendererProps {
  markdown: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdown }) => {
  const renderMarkdown = (text: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = text.split(codeBlockRegex);

    return parts.map((part, index) => {
      if (index % 3 === 2) {
        const language = parts[index - 1] || 'text';
        return (
          <div key={index} className="mb-4">
            <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
              {language.toUpperCase()}
            </div>
            <SyntaxHighlighter
              language={language}
              style={vs}
              showLineNumbers={true}
              wrapLongLines={true}
              customStyle={{ margin: 0 }}
              codeTagProps={{ className: 'syntax-highlighter-code' }}
            >
              {part.trim()}
            </SyntaxHighlighter>
          </div>
        );
      } else if ((index + 1) % 3 === 2) {
        // This is the programming language name
        return null;
      }

      // Render other markdown elements using ReactMarkdown
      return (
        <ReactMarkdown
          key={index}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            h1: ({ children }) => <h1 className="text-4xl font-bold">{children}</h1>,
            h2: ({ children }) => <h2 className="text-3xl font-semibold">{children}</h2>,
            h3: ({ children }) => <h3 className="text-2xl font-medium">{children}</h3>,
            h4: ({ children }) => <h4 className="text-xl font-medium">{children}</h4>,
            h5: ({ children }) => <h5 className="text-lg font-medium">{children}</h5>,
            h6: ({ children }) => <h6 className="text-base font-medium">{children}</h6>,
            ul: ({ children }) => <ul className="list-disc list-inside">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside">{children}</ol>,
            li: ({ children }) => <li className="ml-4 -mt-5">{children}</li>,
            code({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  style={vs}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code
                  className="bg-gray-200 dark:bg-gray-800 text-red-600 font-[Menlo, Monaco, 'Courier New', monospace] px-1 rounded"
                  {...props}
                >
                  {children}
                </code>
              );
            },
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-blue-500 underline hover:text-blue-700 hover:underline"
              >
                {children}
              </a>
            ),
          }}
        >
          {part}
        </ReactMarkdown>
      );
    });
  };

  return <div>{renderMarkdown(markdown)}</div>;
};