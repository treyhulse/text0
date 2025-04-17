"use client";

import { addWebsiteReference } from "@/actions/add-website-reference";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	FileUpload,
	FileUploadDropzone,
	FileUploadItem,
	FileUploadItemDelete,
	FileUploadItemMetadata,
	FileUploadItemPreview,
	FileUploadItemProgress,
	FileUploadList,
	FileUploadTrigger,
} from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { uploadFiles } from "@/lib/uploadthing";
import { useChat } from "@ai-sdk/react";
import { Loader2, PanelRight, Send, Upload, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { toast } from "sonner";
import { UploadThingError } from "uploadthing/server";
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
	const router = useRouter();
	const scrollAreaRef = useRef<HTMLDivElement>(null);

	const { doc_id } = useParams();
	const [model] = useModel();
	const { getSelectedReferences } = useSelectedReferences(doc_id as string);

	// Add reference state
	const [isUploading, setIsUploading] = useState(false);
	const [files, setFiles] = useState<File[]>([]);
	const [openReferenceDialog, setOpenReferenceDialog] = useState(false);
	const [url, setUrl] = useState("");
	const [state, formAction, isPendingAddWebsiteReferenceAction] =
		useActionState(addWebsiteReference, undefined);

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

	// Handle file upload
	const onUpload = useCallback(
		async (
			files: File[],
			{
				onProgress,
			}: {
				onProgress: (file: File, progress: number) => void;
			},
		) => {
			try {
				setIsUploading(true);
				const res = await uploadFiles("documentUploader", {
					files,
					onUploadProgress: ({ file, progress }) => {
						onProgress(file, progress);
					},
				});

				toast.success("Uploaded files:", {
					description: (
						<pre className="mt-2 w-80 rounded-md bg-accent/30 p-4 text-accent-foreground">
							<code>
								{JSON.stringify(
									res.map((file) =>
										file.name.length > 25
											? `${file.name.slice(0, 25)}...`
											: file.name,
									),
									null,
									2,
								)}
							</code>
						</pre>
					),
				});

				// Close the dialog after 2 seconds
				setTimeout(() => {
					setOpenReferenceDialog(false);
				}, 2000);
			} catch (error) {
				setIsUploading(false);

				if (error instanceof UploadThingError) {
					const errorMessage =
						error.data && "error" in error.data
							? error.data.error
							: "Upload failed";
					toast.error(errorMessage);
					return;
				}

				toast.error(
					error instanceof Error ? error.message : "An unknown error occurred",
				);
			} finally {
				setIsUploading(false);
			}
		},
		[],
	);

	const onFileReject = useCallback((file: File, message: string) => {
		toast(message, {
			description: `"${
				file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name
			}" has been rejected`,
		});
	}, []);

	return (
		<SidebarProvider>
			<Sidebar
				collapsible="icon"
				side="right"
				className="border-border border-l bg-background text-foreground transition-all duration-300 ease-in-out"
				variant="sidebar"
			>
				<SidebarHeader className="flex flex-row items-center justify-between border-b bg-background px-4 group-data-[collapsible=icon]:px-2">
					<div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
						<h2 className="font-medium text-sm">Text0 Assistant</h2>
						{status === "streaming" && (
							<Loader2 className="h-4 w-4 animate-spin" />
						)}
					</div>
					<SidebarMenuButton
						tooltip="Toggle AI Assistant"
						className="-mr-2 h-8 w-8"
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
							"border-b bg-background p-2",
							"group-data-[collapsible=icon]:border-none group-data-[collapsible=icon]:p-1",
						)}
					>
						<div className="space-y-2 group-data-[collapsible=icon]:space-y-1">
							<div className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-1">
								<div className="mt-2 group-data-[collapsible=icon]:hidden">
									<div className="flex items-center justify-between">
										<span className="font-medium text-sm">References</span>
										<Dialog
											open={openReferenceDialog}
											onOpenChange={setOpenReferenceDialog}
										>
											<DialogTrigger asChild>
												<Button variant="outline" size="sm" className="ml-auto">
													<Upload className="mr-1 h-3.5 w-3.5" />
													Add Reference
												</Button>
											</DialogTrigger>
											<DialogContent
												title="Add Reference"
												className="sm:max-w-md"
											>
												<DialogHeader>
													<DialogTitle>Add Reference</DialogTitle>
												</DialogHeader>
												<form action={formAction} className="space-y-4">
													<div className="space-y-2">
														<Label htmlFor="url">Website URL</Label>
														<Input
															id="url"
															name="url"
															type="url"
															placeholder="https://example.com"
															value={url}
															onChange={(e) => setUrl(e.target.value)}
															disabled={
																isPendingAddWebsiteReferenceAction ||
																isUploading
															}
														/>
													</div>
													<Button
														type="submit"
														disabled={
															!url ||
															isPendingAddWebsiteReferenceAction ||
															isUploading
														}
													>
														{isPendingAddWebsiteReferenceAction
															? "Adding..."
															: "Add Website Reference"}
													</Button>
												</form>
												<div className="relative my-4">
													<div className="absolute inset-0 flex items-center">
														<span className="w-full border-t" />
													</div>
													<div className="relative flex justify-center text-xs uppercase">
														<span className="bg-background px-2 text-muted-foreground">
															Or upload a file
														</span>
													</div>
												</div>
												<FileUpload
													accept=".pdf,.docx,.xlsx,.pptx,.txt,.md"
													maxFiles={1}
													maxSize={16 * 1024 * 1024}
													className="w-full max-w-md"
													onAccept={(files) => setFiles(files)}
													onUpload={onUpload}
													onFileReject={onFileReject}
													multiple={false}
													disabled={
														isUploading || isPendingAddWebsiteReferenceAction
													}
												>
													<FileUploadDropzone>
														<div className="flex flex-col items-center gap-1">
															<div className="flex items-center justify-center rounded-full border p-2.5">
																<Upload className="size-6 text-muted-foreground" />
															</div>
															<p className="font-medium text-sm">
																Drag & drop documents here
															</p>
															<p className="text-muted-foreground text-xs">
																Or click to browse (PDF, Word, Excel,
																PowerPoint, TXT, Markdown)
															</p>
														</div>
														<FileUploadTrigger asChild>
															<Button
																variant="outline"
																size="sm"
																className="mt-2 w-fit"
															>
																Browse files
															</Button>
														</FileUploadTrigger>
													</FileUploadDropzone>
													<FileUploadList>
														{files.map((file) => (
															<FileUploadItem
																key={file.lastModified}
																value={file}
															>
																<div className="flex w-full items-center gap-2">
																	<FileUploadItemPreview />
																	<FileUploadItemMetadata />
																	<FileUploadItemDelete asChild>
																		<Button
																			variant="ghost"
																			size="icon"
																			className="size-7"
																		>
																			<X />
																		</Button>
																	</FileUploadItemDelete>
																</div>
																<FileUploadItemProgress />
															</FileUploadItem>
														))}
													</FileUploadList>
												</FileUpload>
											</DialogContent>
										</Dialog>
									</div>
									<ReferenceSelector />
								</div>
							</div>
						</div>
					</SidebarGroup>

					{/* Chat Messages - Hide when collapsed */}
					<SidebarGroup className="min-h-0 flex-1 group-data-[collapsible=icon]:hidden">
						<ScrollArea className="min-h-0 flex-1" ref={scrollAreaRef}>
							<div className="flex flex-col gap-3 p-4">
								{messages.map((message) => (
									<div
										key={message.id}
										className={cn(
											"break-words rounded-lg px-3 py-2 text-sm leading-relaxed",
											message.role === "user"
												? "bg-primary/10 text-foreground"
												: "bg-muted/50 text-foreground/90",
										)}
									>
										{message.content}
									</div>
								))}
								{error && (
									<div className="rounded-lg bg-destructive/10 px-3 py-2 text-destructive text-sm">
										Error: {error.message}
									</div>
								)}
							</div>
						</ScrollArea>
					</SidebarGroup>

					{/* Input Area - Hide when collapsed */}
					<SidebarGroup className="border-t bg-background p-2 group-data-[collapsible=icon]:hidden">
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
										"max-h-[400px] min-h-[44px]",
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
								<div className="-translate-y-1/2 absolute top-1/2 right-1 flex items-center gap-1">
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
