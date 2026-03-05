import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { ChatSidebar, Conversation } from "@/components/chat/ChatSidebar";
import { ChatInput } from "@/components/chat/ChatInput";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ThinkingAnimation } from "@/components/chat/ThinkingAnimation";
import { CodePreview } from "@/components/chat/CodePreview";
import { streamChat, Msg } from "@/lib/chat-stream";
import { toast } from "sonner";
import { saveAs } from "file-saver";

interface ConvMessages {
  [convId: string]: Msg[];
}

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [convMessages, setConvMessages] = useState<ConvMessages>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [previewCode, setPreviewCode] = useState<{ code: string; lang: string } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = activeConvId ? convMessages[activeConvId] || [] : [];

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const createConversation = (firstMsg?: string) => {
    const id = crypto.randomUUID();
    const conv: Conversation = {
      id,
      title: firstMsg?.slice(0, 40) || "Novo Chat",
      createdAt: new Date(),
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveConvId(id);
    setConvMessages((prev) => ({ ...prev, [id]: [] }));
    return id;
  };

  const handleSend = async (input: string, mode = "chat") => {
    let convId = activeConvId;
    if (!convId) {
      convId = createConversation(input);
    } else {
      // Update title if first message
      const msgs = convMessages[convId] || [];
      if (msgs.length === 0) {
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, title: input.slice(0, 40) } : c))
        );
      }
    }

    const userMsg: Msg = { role: "user", content: input };
    setConvMessages((prev) => ({
      ...prev,
      [convId!]: [...(prev[convId!] || []), userMsg],
    }));

    setIsLoading(true);
    let assistantSoFar = "";

    const upsertAssistant = (chunk: string, images?: string[]) => {
      assistantSoFar += chunk;
      setConvMessages((prev) => {
        const msgs = prev[convId!] || [];
        const last = msgs[msgs.length - 1];
        if (last?.role === "assistant") {
          return {
            ...prev,
            [convId!]: msgs.map((m, i) =>
              i === msgs.length - 1 ? { ...m, content: assistantSoFar, images: images || m.images } : m
            ),
          };
        }
        return {
          ...prev,
          [convId!]: [...msgs, { role: "assistant", content: assistantSoFar, images }],
        };
      });
    };

    try {
      setIsStreaming(true);
      await streamChat({
        messages: [...(convMessages[convId] || []), userMsg],
        mode,
        onDelta: (chunk) => {
          setIsLoading(false);
          upsertAssistant(chunk);
        },
        onImage: (url) => {
          setIsLoading(false);
          setConvMessages((prev) => ({
            ...prev,
            [convId!]: [
              ...(prev[convId!] || []),
              { role: "assistant", content: "Aqui está a imagem gerada:", images: [url] },
            ],
          }));
        },
        onDone: () => {
          setIsStreaming(false);
          setIsLoading(false);
        },
        onError: (err) => {
          setIsStreaming(false);
          setIsLoading(false);
          toast.error(err);
        },
      });
    } catch {
      setIsStreaming(false);
      setIsLoading(false);
      toast.error("Erro ao processar mensagem");
    }
  };

  const handleDownloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, filename);
    toast.success(`Arquivo ${filename} baixado!`);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <ChatSidebar
        conversations={conversations}
        activeId={activeConvId}
        collapsed={sidebarCollapsed}
        onSelect={setActiveConvId}
        onNew={() => createConversation()}
        onDelete={(id) => {
          setConversations((prev) => prev.filter((c) => c.id !== id));
          if (activeConvId === id) setActiveConvId(null);
          setConvMessages((prev) => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
          });
        }}
        onToggle={() => setSidebarCollapsed((p) => !p)}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          {messages.length === 0 && !isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full gap-6"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center border border-border"
              >
                <Sparkles className="w-10 h-10 text-foreground/60" />
              </motion.div>
              <div className="text-center max-w-md">
                <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">
                  Nexo AI
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Chat, geração de imagens, código, áudio e vídeo. Crie, edite e baixe qualquer coisa.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {[
                  "Crie uma landing page moderna",
                  "Gere uma imagem futurista",
                  "Escreva um script Python",
                  "Crie um componente React",
                ].map((suggestion) => (
                  <motion.button
                    key={suggestion}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSend(suggestion)}
                    className="px-4 py-3 rounded-xl bg-secondary/50 border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-left"
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {messages.map((msg, i) => (
                <MessageBubble
                  key={i}
                  role={msg.role}
                  content={msg.content}
                  isStreaming={isStreaming && i === messages.length - 1 && msg.role === "assistant"}
                  images={msg.images}
                  onPreviewCode={(code, lang) => setPreviewCode({ code, lang })}
                  onDownloadFile={handleDownloadFile}
                />
              ))}
              {isLoading && <ThinkingAnimation />}
            </div>
          )}
        </div>

        <ChatInput onSend={handleSend} disabled={isLoading || isStreaming} />
      </div>

      {/* Code Preview Panel */}
      <AnimatePresence>
        {previewCode && (
          <div className="w-[45%] min-w-[400px]">
            <CodePreview
              code={previewCode.code}
              language={previewCode.lang}
              onClose={() => setPreviewCode(null)}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
