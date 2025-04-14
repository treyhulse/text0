import { useRef, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Send,
  Sparkles,
  Wand2,
  Type,
  Check,
  ChevronRight,
  Plus,
  History,
  X,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import { ModelSelector } from "./model-selector";
import { useModel } from "@/hooks/use-model";

export interface AIChatSidebarProps {
  content: string;
  isEnabled: boolean;
  onEnableChange: (enabled: boolean) => void;
  onPendingUpdate?: (update: string | null) => void;
}

const QUICK_ACTIONS = [
  {
    icon: Sparkles,
    label: "Improve writing",
    prompt: "Improve this text while maintaining its meaning:",
  },
  {
    icon: Check,
    label: "Fix grammar & spelling",
    prompt: "Fix any grammar and spelling errors in this text:",
  },
  {
    icon: Type,
    label: "Make it concise",
    prompt: "Make this text more concise while keeping its key points:",
  },
  {
    icon: Wand2,
    label: "Make it professional",
    prompt: "Make this text more professional and formal:",
  },
];

export function AIChatSidebar({
  content,
  isEnabled,
  onEnableChange,
  onPendingUpdate,
}: Readonly<AIChatSidebarProps>) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [model] = useModel();

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setInput,
    status,
    error,
    reload: reloadChat,
    stop,
  } = useChat({
    api: "/api/chat",
    body: {
      model,
    },
    onFinish: (message) => {
      if (message.content.startsWith("UPDATED_CONTENT:")) {
        const newContent = message.content
          .replace("UPDATED_CONTENT:", "")
          .trim();
        if (onPendingUpdate) {
          onPendingUpdate(newContent);
        }
      }
      scrollToBottom();
    },
  });

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight;
      }
    }
  };

  // Memoize scrollToBottom to prevent unnecessary re-renders
  const scrollToBottomMemo = useCallback(scrollToBottom, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottomMemo();
    }
  }, [messages.length, scrollToBottomMemo]);

  const handleQuickAction = (prompt: string) => {
    if (status === "streaming") return;
    setInput(`${prompt}\n\n${content}`);
    handleSubmit();
  };

  const customSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status === "streaming") return;

    if (!input.includes(content)) {
      setInput(`${input}\n\nHere's the current content:\n${content}`);
    }
    handleSubmit(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      customSubmit(e);
    }
  };

  return (
    <div className="h-full border-l border-border bg-background/95 flex flex-col">
      {/* Header */}
      <div className="px-4 h-12 border-b flex items-center justify-between bg-background">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium">AI Assistant</h2>
          {status === "streaming" && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setInput("");
              onEnableChange(!isEnabled);
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => reloadChat()}
            disabled={!messages.length || status === "streaming"}
          >
            <History className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEnableChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-2 border-b bg-background">
        <ModelSelector />
        <div className="mt-2 space-y-1">
          {QUICK_ACTIONS.map((action) => (
            <Button
              key={action.label}
              variant="ghost"
              className="w-full justify-start h-8 px-2 text-xs"
              onClick={() => handleQuickAction(action.prompt)}
              disabled={status === "streaming"}
            >
              <action.icon className="h-3.5 w-3.5 mr-2" />
              {action.label}
              <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-50" />
            </Button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="flex flex-col gap-3 p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "text-sm px-3 py-2 leading-relaxed rounded-lg",
                message.role === "user"
                  ? "text-foreground bg-primary/10"
                  : "text-foreground/90 bg-muted/50"
              )}
            >
              {message.content}
            </div>
          ))}
          {error && (
            <div className="text-sm px-3 py-2 text-destructive bg-destructive/10 rounded-lg">
              Error: {error.message}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-2 border-t bg-background">
        <form onSubmit={customSubmit} className="flex flex-col gap-2">
          <div className="relative">
            <Textarea
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your text..."
              className="min-h-[44px] max-h-[400px] resize-none text-sm pr-24 py-2"
              rows={1}
              disabled={status === "streaming"}
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {status === "streaming" ? (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={stop}
                >
                  <X className="h-3 w-3" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  disabled={!input.trim()}
                >
                  <Send className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
