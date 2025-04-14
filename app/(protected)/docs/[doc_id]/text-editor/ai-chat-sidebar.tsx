"use client";

import { useRef, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Send, Plus, History, X, MoreHorizontal, Loader2 } from "lucide-react";
import { ModelSelector } from "./model-selector";
import { useModel } from "@/hooks/use-model";
import { ReferenceSelector } from "./reference-selector";

export interface AIChatSidebarProps {
	content: string;
	isEnabled: boolean;
	onEnableChange: (enabled: boolean) => void;
	onPendingUpdate?: (update: string | null) => void;
}

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
				"[data-radix-scroll-area-viewport]",
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
		<div className="h-full border-l border-border bg-background/95 flex flex-col max-h-full">
			{/* Header */}
			<div className="shrink-0 px-4 h-12 border-b flex items-center justify-between bg-background">
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
						aria-label="New chat"
					>
						<Plus className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={() => reloadChat()}
						disabled={!messages.length || status === "streaming"}
						aria-label="Reload chat"
					>
						<History className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						aria-label="More options"
					>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						onClick={() => onEnableChange(false)}
						aria-label="Close chat"
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Quick Actions */}
			<div className="shrink-0 p-2 border-b bg-background">
				<ModelSelector />
				<ReferenceSelector />
			</div>

			{/* Chat Messages */}
			<ScrollArea className="flex-1 min-h-0" ref={scrollAreaRef}>
				<div className="flex flex-col gap-3 p-4">
					{messages.map((message) => (
						<div
							key={message.id}
							className={cn(
								"text-sm px-3 py-2 leading-relaxed rounded-lg",
								message.role === "user"
									? "text-foreground bg-primary/10"
									: "text-foreground/90 bg-muted/50",
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
			<div className="shrink-0 p-2 border-t bg-background">
				<form onSubmit={customSubmit} className="flex flex-col gap-2">
					<div className="relative">
						<Textarea
							value={input}
							onChange={handleInputChange}
							onKeyDown={handleKeyDown}
							placeholder="Ask me anything about your text..."
							className="flex w-full min-w-0 shrink rounded-md border border-grep-4 bg-grep-0 px-3 py-1 text-sm transition-colors focus-visible:border-grep-12 focus-visible:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-grep-4 disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-grep-7 min-h-[44px] max-h-[400px] resize-none pr-24"
							rows={1}
							disabled={status === "streaming"}
							spellCheck="false"
							autoCapitalize="off"
							autoComplete="off"
							autoCorrect="off"
							aria-label="Chat input"
						/>
						<div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
							{status === "streaming" ? (
								<Button
									type="button"
									size="icon"
									variant="ghost"
									className="h-6 w-6"
									onClick={stop}
									aria-label="Stop generating"
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
									aria-label="Send message"
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
