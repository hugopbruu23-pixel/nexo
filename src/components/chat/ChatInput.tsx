import { useState, useRef, KeyboardEvent } from "react";
import { motion } from "framer-motion";
import {
  Send,
  Image,
  FileCode,
  Paperclip,
  Sparkles,
  Video,
  Music,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatInputProps {
  onSend: (message: string, mode?: string) => void;
  disabled?: boolean;
}

const modes = [
  { id: "chat", icon: Sparkles, label: "Chat" },
  { id: "image", icon: Image, label: "Gerar Imagem" },
  { id: "code", icon: FileCode, label: "Gerar Código" },
  { id: "video", icon: Video, label: "Gerar Vídeo" },
  { id: "audio", icon: Music, label: "Gerar Áudio" },
];

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("chat");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim(), mode);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
    }
  };

  const activeMode = modes.find((m) => m.id === mode)!;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border-t border-border bg-background"
    >
      {/* Mode selector */}
      <div className="flex gap-1 mb-3">
        {modes.map((m) => (
          <Tooltip key={m.id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => setMode(m.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  mode === m.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <m.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>{m.label}</TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Input area */}
      <div className="flex items-end gap-2 nexo-glass rounded-xl p-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={`${activeMode.label}... Digite sua mensagem`}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-foreground placeholder:text-muted-foreground py-2 px-2 min-h-[40px] max-h-[200px] font-sans"
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          size="sm"
          className="rounded-lg h-9 w-9 p-0 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 transition-all"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};
