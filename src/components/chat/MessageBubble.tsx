import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, Download, Eye } from "lucide-react";
import { useState } from "react";
import { StreamingCursor } from "./StreamingCursor";
import { Button } from "@/components/ui/button";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  images?: string[];
  onPreviewCode?: (code: string, lang: string) => void;
  onDownloadFile?: (content: string, filename: string) => void;
}

export const MessageBubble = ({
  role,
  content,
  isStreaming,
  images,
  onPreviewCode,
  onDownloadFile,
}: MessageBubbleProps) => {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-card border border-border"
        }`}
      >
        {images && images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {images.map((img, i) => (
              <motion.img
                key={i}
                src={img}
                alt="Generated"
                className="rounded-lg max-w-[300px] max-h-[300px] object-cover border border-border"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              />
            ))}
          </div>
        )}
        <div className="prose prose-invert prose-sm max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0">
          <ReactMarkdown
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                const codeStr = String(children).replace(/\n$/, "");

                if (match) {
                  return (
                    <CodeBlock
                      code={codeStr}
                      language={match[1]}
                      onPreview={onPreviewCode}
                      onDownload={onDownloadFile}
                    />
                  );
                }
                return (
                  <code
                    className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
          {isStreaming && <StreamingCursor />}
        </div>
      </div>
    </motion.div>
  );
};

function CodeBlock({
  code,
  language,
  onPreview,
  onDownload,
}: {
  code: string;
  language: string;
  onPreview?: (code: string, lang: string) => void;
  onDownload?: (content: string, filename: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPreviewable = ["html", "jsx", "tsx"].includes(language);
  const ext = language === "tsx" || language === "jsx" ? "tsx" : language;

  return (
    <div className="relative group rounded-lg overflow-hidden my-3 border border-border">
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/50 border-b border-border">
        <span className="text-xs font-mono text-muted-foreground">{language}</span>
        <div className="flex gap-1">
          {isPreviewable && onPreview && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onPreview(code, language)}
            >
              <Eye className="w-3 h-3 mr-1" />
              Preview
            </Button>
          )}
          {onDownload && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onDownload(code, `code.${ext}`)}
            >
              <Download className="w-3 h-3 mr-1" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={handleCopy}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          background: "hsl(0 0% 6%)",
          fontSize: "0.8rem",
          padding: "1rem",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
