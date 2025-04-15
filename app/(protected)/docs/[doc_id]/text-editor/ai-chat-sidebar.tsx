"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarHeader,
	SidebarMenuButton,
	SidebarProvider,
	SidebarRail,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { useModel } from "@/hooks/use-model";
import { useSelectedReferences } from "@/hooks/use-selected-references";
import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { Loader2, PanelRight, Send, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { ModelSelector } from "./model-selector";
import { ReferenceSelector } from "./reference-selector";

export interface AIChatSidebarProps {
	content: string;
	isEnabled: boolean;
	onPendingUpdate?: (update: string | null) => void;
}

export function AIChatSidebar({
	content,
	isEnabled,
	onPendingUpdate,
}: Readonly<AIChatSidebarProps>) {
	const scrollAreaRef = useRef<HTMLDivElement>(null);

	const { doc_id } = useParams();
	const [model] = useModel();
	const { getSelectedReferences } = useSelectedReferences(doc_id as string);
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
			references: getSelectedReferences(),
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
		<SidebarProvider>
			<Sidebar
				collapsible="icon"
				side="right"
				className="bg-background text-foreground border-l border-border transition-all duration-300 ease-in-out"
				variant="sidebar"
			>
				<SidebarHeader className="px-4 border-b flex flex-row items-center justify-between bg-background group-data-[collapsible=icon]:px-2">
					<div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
						<h2 className="text-sm font-medium">Text0 Assistant</h2>
						{status === "streaming" && (
							<Loader2 className="h-4 w-4 animate-spin" />
						)}
					</div>
					<SidebarMenuButton
						tooltip="Toggle AI Assistant"
						className="h-8 w-8 -mr-2"
						asChild
					>
						<SidebarTrigger>
							<PanelRight className="h-4 w-4" />
						</SidebarTrigger>
					</SidebarMenuButton>
				</SidebarHeader>

				<SidebarContent className="group-data-[collapsible=icon]:p-0">
					{/* Quick Actions - Only show ModelSelector when collapsed */}
					<SidebarGroup
						className={cn(
							"p-2 border-b bg-background",
							"group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:p-1",
						)}
					>
						<div className="space-y-2 group-data-[collapsible=icon]:space-y-1">
							<div className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-1">
								<ModelSelector />
								<div className="group-data-[collapsible=icon]:hidden mt-2">
									<ReferenceSelector />
								</div>
							</div>
						</div>
					</SidebarGroup>

					{/* Chat Messages - Hide when collapsed */}
					<SidebarGroup className="flex-1 min-h-0 group-data-[collapsible=icon]:hidden">
						<ScrollArea className="flex-1 min-h-0" ref={scrollAreaRef}>
							<div className="flex flex-col gap-3 p-4">
								{messages.map((message) => (
									<div
										key={message.id}
										className={cn(
											"text-sm px-3 py-2 leading-relaxed rounded-lg break-words",
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
					</SidebarGroup>

					{/* Input Area - Hide when collapsed */}
					<SidebarGroup className="p-2 border-t bg-background group-data-[collapsible=icon]:hidden">
						<form onSubmit={customSubmit} className="flex flex-col gap-2">
							<div className="relative">
								<Textarea
									value={input}
									onChange={handleInputChange}
									onKeyDown={handleKeyDown}
									placeholder={
										status === "streaming" ? "Generating..." : "Ask me anything"
									}
									className={cn(
										"flex w-full min-w-0 shrink px-3 py-1 text-sm",
										"disabled:cursor-not-allowed disabled:opacity-50",
										"placeholder:text-muted-foreground",
										"min-h-[44px] max-h-[400px]",
										"pr-24",
										"resize-none",
									)}
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
					</SidebarGroup>
				</SidebarContent>

				<SidebarRail />
			</Sidebar>
		</SidebarProvider>
	);
}
