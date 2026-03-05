import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";

interface CodePreviewProps {
  code: string;
  language: string;
  onClose: () => void;
}

export const CodePreview = ({ code, language, onClose }: CodePreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [key, setKey] = useState(0);

  const getPreviewHtml = () => {
    if (language === "html") return code;

    // Wrap JSX/TSX in a basic HTML page
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: #0a0a0a; color: #f5f5f5; padding: 20px; }
  </style>
  <script src="https://cdn.tailwindcss.com"><\/script>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    import React from 'https://esm.sh/react@18';
    import ReactDOM from 'https://esm.sh/react-dom@18/client';
    
    // Simplified preview
    const root = document.getElementById('root');
    root.innerHTML = \`<div style="padding:20px"><pre style="white-space:pre-wrap;font-family:monospace;font-size:14px">${code.replace(/`/g, '\\`').replace(/\$/g, '\\$')}</pre></div>\`;
  <\/script>
</body>
</html>`;
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `preview.${language === "tsx" || language === "jsx" ? "tsx" : language}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full border-l border-border bg-background"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/60" />
            <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
            <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
          </div>
          <span className="text-xs text-muted-foreground font-mono ml-2">Preview</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setKey((k) => k + 1)}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleDownload}>
            <Download className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}>
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* iframe */}
      <div className="flex-1 bg-card">
        <iframe
          key={key}
          ref={iframeRef}
          srcDoc={getPreviewHtml()}
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-same-origin"
          title="Code Preview"
        />
      </div>
    </motion.div>
  );
};
