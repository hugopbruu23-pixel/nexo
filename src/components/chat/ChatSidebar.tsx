import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Plus,
  Trash2,
  Settings,
  Zap,
  Image,
  FileCode,
  Music,
  Video,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Conversation {
  id: string;
  title: string;
  lastMessage?: string;
  createdAt: Date;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  collapsed: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onToggle: () => void;
}

export const ChatSidebar = ({
  conversations,
  activeId,
  collapsed,
  onSelect,
  onNew,
  onDelete,
  onToggle,
}: ChatSidebarProps) => {
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 60 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-full flex flex-col border-r border-border bg-sidebar overflow-hidden shrink-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border min-h-[56px]">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-foreground" />
              <span className="font-semibold text-sm text-foreground tracking-tight">NEXO AI</span>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* New chat */}
      <div className="p-2">
        <Button
          onClick={onNew}
          variant="outline"
          className={`w-full justify-start gap-2 border-border text-foreground hover:bg-accent ${
            collapsed ? "px-0 justify-center" : ""
          }`}
          size="sm"
        >
          <Plus className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Novo Chat</span>}
        </Button>
      </div>

      {/* Capabilities */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-3 py-2"
        >
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            Capacidades
          </p>
          <div className="grid grid-cols-2 gap-1">
            {[
              { icon: MessageSquare, label: "Chat" },
              { icon: Image, label: "Imagens" },
              { icon: FileCode, label: "Código" },
              { icon: Video, label: "Vídeo" },
              { icon: Music, label: "Áudio" },
              { icon: Zap, label: "Preview" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-secondary/50 text-muted-foreground"
              >
                <Icon className="w-3 h-3" />
                <span className="text-[11px]">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        <AnimatePresence>
          {conversations.map((conv) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onClick={() => onSelect(conv.id)}
              className={`group flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer mb-0.5 transition-colors ${
                activeId === conv.id
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              {!collapsed && (
                <>
                  <span className="text-xs truncate flex-1">{conv.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                  </button>
                </>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
};
