"use client";

import { useCompletion } from "@ai-sdk/react";
import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { UploadDropzone } from "@/lib/uploadthing";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Upload, FileText, Maximize2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useModel } from "@/hooks/use-model";
import { toast } from "sonner";
import { AIChatSidebar } from "./ai-chat-sidebar";
import { TextSelectionMenu } from "@/components/text-selection-menu";
import { InlineDiffView } from "@/components/inline-diff-view";
import { EditableDocumentName } from "@/components/editable-document-name";
import useDebouncedCallback from "@/hooks/use-debounced-callback";
import { useSelectedReferences } from "@/hooks/use-selected-references";
// Add these types at the top
interface TextEditorProps {
	initialContent: string;
	documentId: string;
	initialName: string;
}

export function TextEditor({
	initialContent,
	documentId,
	initialName,
}: Readonly<TextEditorProps>) {
	const editorRef = React.useRef<HTMLTextAreaElement>(null);
	const [cursorPosition, setCursorPosition] = React.useState(0);
	const [isAutocompleteEnabled, setIsAutocompleteEnabled] =
		React.useState(true);
	const [isAIChatOpen, setIsAIChatOpen] = React.useState(true);
	const [isZenMode, setIsZenMode] = React.useState(false);
	const [isAcceptingDiff, setIsAcceptingDiff] = React.useState(false);

	const [model] = useModel();
	const { getSelectedReferences } = useSelectedReferences(documentId);

	const { completion, input, setInput, handleSubmit, stop, setCompletion } =
		useCompletion({
			api: `/api/completion?model=${model}`,
			initialInput: initialContent,
			body: {
				references: getSelectedReferences(),
			},
		});

	const [selectedText, setSelectedText] = React.useState("");
	const [selectionPosition, setSelectionPosition] = React.useState<{
		x: number;
		y: number;
	} | null>(null);
	const [selectedRange, setSelectedRange] = React.useState<Range | null>(null);

	const [pendingUpdate, setPendingUpdate] = React.useState<string | null>(null);
	const [isTextLoading, setIsTextLoading] = useState(false);
	const [selectionStyles, setSelectionStyles] = useState<{
		backgroundColor: string;
		transition: string;
	} | null>(null);

	const [isModifying, setIsModifying] = useState(false);
	const [streamingText, setStreamingText] = useState("");
	const [loadingProgress, setLoadingProgress] = useState(0);

	const [lastManualInput, setLastManualInput] = React.useState<string | null>(
		null,
	);

	const { complete } = useCompletion({
		api: "/api/text-modification",
		body: { model },
		onResponse: (response) => {
			if (!response.ok) throw new Error(response.statusText);
		},
		onFinish: () => {
			setIsModifying(false);
			setStreamingText("");
		},
		onError: (error) => {
			console.error("Error modifying text:", error);
			setIsModifying(false);
			setStreamingText("");
			setPendingUpdate(null);
		},
	});

	// Add debounced update function
	const debouncedUpdateContent = useDebouncedCallback(
		(documentId: string, content: string) => {
			fetch(`/api/docs/${documentId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content }),
			});
		},
		3000,
	);

	React.useEffect(() => {
		if (!isAutocompleteEnabled) {
			setCompletion("");
		}
	}, [isAutocompleteEnabled, setCompletion]);

	React.useEffect(() => {
		// Only trigger autocomplete if the input change came from manual typing
		if (isAutocompleteEnabled && input === lastManualInput) {
			const timer = setTimeout(() => {
				handleSubmit();
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [handleSubmit, isAutocompleteEnabled, input, lastManualInput]);

	React.useEffect(() => {
		if (editorRef.current && cursorPosition === -1) {
			editorRef.current.selectionStart = editorRef.current.selectionEnd =
				input.length;
			setCursorPosition(input.length);
		}
	}, [input, cursorPosition]);

	// Handle zen mode toggle with keyboard shortcut
	React.useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setIsZenMode((prev) => !prev);
				if (!isZenMode) {
					setIsAIChatOpen(false);
					// Request full screen when entering zen mode
					document.documentElement.requestFullscreen().catch((err) => {
						console.log("Error attempting to enable full-screen mode:", err);
					});
				} else if (document.fullscreenElement) {
					// Exit full screen when leaving zen mode
					document.exitFullscreen().catch((err) => {
						console.log("Error attempting to exit full-screen mode:", err);
					});
				}
			}
		};

		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, [isZenMode]);

	// Handle AI Chat toggle with keyboard shortcut
	React.useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			if (e.key === "o" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setIsAIChatOpen((prev) => !prev);
			}
		};

		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, []);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Tab" && completion) {
			e.preventDefault();
			const completionText = parseCompletion(completion, input);
			stop();
			setCompletion("");
			const newText =
				input.substring(0, cursorPosition) +
				completionText +
				input.substring(cursorPosition);
			setInput(newText);
			// Set cursor position to end of the inserted completion
			const newCursorPosition = cursorPosition + completionText.length;
			setCursorPosition(newCursorPosition);
			// Ensure the textarea cursor is also updated
			if (editorRef.current) {
				editorRef.current.selectionStart = newCursorPosition;
				editorRef.current.selectionEnd = newCursorPosition;
			}
		} else if (e.key === "Escape") {
			e.preventDefault();
			stop();
			setCompletion("");
		}
	};

	const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newText = e.target.value;
		const newPosition = e.target.selectionStart;
		stop();
		setInput(newText);
		setLastManualInput(newText); // Track that this was a manual input
		setCursorPosition(newPosition);
		setIsAcceptingDiff(false);
		// Add debounced update
		debouncedUpdateContent(documentId, newText);
	};

	const handleSelectionChange = () => {
		if (editorRef.current) {
			const selection = window.getSelection();
			if (selection?.toString()) {
				const range = selection.getRangeAt(0);
				const selectedText = selection.toString();

				// Get textarea position and scroll
				const textareaRect = editorRef.current.getBoundingClientRect();
				const scrollTop = editorRef.current.scrollTop;

				// Get selection coordinates and full text
				const startCoords = getCaretCoordinates(
					editorRef.current,
					editorRef.current.selectionStart,
				);
				const fullText = editorRef.current.value;

				// Calculate line information
				const lines = fullText.split("\n");
				let currentPos = 0;
				let selectionStartLine = -1;
				let positionInLine = 0;

				// Find which line contains the selection start
				for (let i = 0; i < lines.length; i++) {
					const lineLength = lines[i].length + 1; // +1 for newline
					if (currentPos + lineLength > editorRef.current.selectionStart) {
						selectionStartLine = i;
						positionInLine = editorRef.current.selectionStart - currentPos;
						break;
					}
					currentPos += lineLength;
				}

				// Calculate average character width using a test span
				const testSpan = document.createElement("span");
				testSpan.style.font = getComputedStyle(editorRef.current).font;
				testSpan.style.visibility = "hidden";
				testSpan.style.position = "absolute";
				testSpan.textContent = selectedText;
				document.body.appendChild(testSpan);
				const charWidth = testSpan.offsetWidth / selectedText.length;
				document.body.removeChild(testSpan);

				// Calculate center based on character count and line position
				const MAX_CHARS = 98;
				const totalChars = selectedText.length;

				let effectiveLength: number;
				if (selectionStartLine >= 0) {
					const lineStartToSelection = positionInLine;
					if (lineStartToSelection > MAX_CHARS) {
						// If selection starts after line wrap, use modulo
						effectiveLength = lineStartToSelection % MAX_CHARS;
					} else if (totalChars > MAX_CHARS) {
						// If selection is longer than max chars, limit to max
						effectiveLength = MAX_CHARS;
					} else {
						// Otherwise use actual length
						effectiveLength = totalChars;
					}
				} else {
					effectiveLength = Math.min(totalChars, MAX_CHARS);
				}

				const selectionWidth = effectiveLength * charWidth;
				const centerX =
					textareaRect.left + startCoords.left + selectionWidth / 2;
				const y = textareaRect.top + startCoords.top - scrollTop;

				// Set selection styles
				setSelectionStyles({
					backgroundColor: "hsl(var(--primary) / 0.1)",
					transition: "background-color 0.2s ease",
				});

				// Store the range and text
				setSelectedRange(range.cloneRange());
				setSelectedText(selectedText);

				// Position menu at the exact center
				setSelectionPosition({
					x: centerX,
					y: y,
				});
			} else {
				setSelectedText("");
				setSelectionPosition(null);
				setSelectedRange(null);
				setSelectionStyles(null);
			}
		}
	};

	// Add helper function to calculate caret coordinates
	function getCaretCoordinates(element: HTMLTextAreaElement, position: number) {
		const div = document.createElement("div");
		const styles = getComputedStyle(element);
		const properties = [
			"fontFamily",
			"fontSize",
			"fontWeight",
			"wordWrap",
			"whiteSpace",
			"borderLeftWidth",
			"borderTopWidth",
			"borderRightWidth",
			"borderBottomWidth",
			"paddingLeft",
			"paddingTop",
			"paddingRight",
			"paddingBottom",
			"lineHeight",
		];

		for (const prop of properties) {
			// @ts-ignore
			div.style[prop] = styles[prop];
		}

		div.style.position = "absolute";
		div.style.top = "0";
		div.style.left = "0";
		div.style.visibility = "hidden";
		div.style.whiteSpace = "pre-wrap";

		const text = element.value.substring(0, position);
		div.textContent = text;

		const span = document.createElement("span");
		span.textContent = element.value.substring(position) || ".";
		div.appendChild(span);

		document.body.appendChild(div);
		const coordinates = {
			top:
				span.offsetTop +
				Number.parseInt(styles.borderTopWidth) +
				Number.parseInt(styles.paddingTop),
			left:
				span.offsetLeft +
				Number.parseInt(styles.borderLeftWidth) +
				Number.parseInt(styles.paddingLeft),
		};
		document.body.removeChild(div);

		return coordinates;
	}

	// Restore selection when dropdown opens
	const handleDropdownOpen = (open: boolean) => {
		if (open && selectedRange) {
			const selection = window.getSelection();
			selection?.removeAllRanges();
			selection?.addRange(selectedRange);
		}
	};

	const handleModifyText = (modifiedText: string) => {
		if (editorRef.current) {
			// Keep the selection and show loading state
			setIsTextLoading(true);
			setSelectionStyles({
				backgroundColor: "hsl(var(--primary) / 0.15)",
				transition: "background-color 0.3s ease",
			});

			// Show the streaming process in the selection
			setPendingUpdate(modifiedText);
		}
	};

	const handleModificationStart = async (instruction: string) => {
		setIsModifying(true);
		setStreamingText("");
		setLoadingProgress(0);

		const progressInterval = setInterval(() => {
			setLoadingProgress((prev) => {
				if (prev >= 100) {
					clearInterval(progressInterval);
					return 100;
				}
				const increment = Math.max(1, (100 - prev) * 0.1);
				return Math.min(99, prev + increment);
			});
		}, 100);

		try {
			const stream = await complete(`${instruction}:\n\n${selectedText}`);

			if (stream) {
				setPendingUpdate(stream);
			}
		} catch (error) {
			console.error("Error in modification:", error);
			setIsModifying(false);
			setStreamingText("");
			setPendingUpdate(null);
		} finally {
			clearInterval(progressInterval);
			setLoadingProgress(100);
			setTimeout(() => setLoadingProgress(0), 300);
		}
	};

	const displayedCompletion = parseCompletion(completion, input);

	return (
		<div className="relative w-full h-full bg-background flex">
			<div
				className={cn(
					"flex-1 flex flex-col relative",
					!isAIChatOpen && "pr-0",
					isZenMode && "bg-background/95 fixed inset-0 z-50",
				)}
			>
				{/* Decorative gradients - only show when modifying */}
				{isModifying && (
					<>
						<div
							className="pointer-events-none absolute left-[15%] top-1/4 h-[400px] w-[400px] animate-float-slow"
							style={{
								background:
									"radial-gradient(circle at center,var(--primary) 0%, transparent 70%)",
								opacity: 0.15,
								filter: "blur(60px)",
							}}
						/>
						<div
							className="pointer-events-none absolute bottom-1/3 right-[15%] h-[350px] w-[350px] animate-float"
							style={{
								background:
									"radial-gradient(circle at center, var(--primary) 0%, transparent 70%)",
								opacity: 0.12,
								filter: "blur(50px)",
							}}
						/>
					</>
				)}

				<div className="flex h-full justify-center py-4">
					<div className={cn("w-full max-w-4xl h-full pt-8")}>
						{/* Add EditableDocumentName component */}
						<EditableDocumentName
							documentId={documentId}
							initialName={initialName}
						/>
						<div className="relative w-full h-[calc(100%-2rem)] flex-1">
							<textarea
								ref={editorRef}
								value={input}
								onChange={handleInput}
								onKeyDown={handleKeyDown}
								onSelect={handleSelectionChange}
								onMouseUp={handleSelectionChange}
								placeholder="Start writing..."
								className={cn(
									"w-full [h-full flex-1 outline-none whitespace-pre-wrap font-serif text-base bg-transparent resize-none placeholder:text-muted-foreground/50 px-8",
									isZenMode && "leading-relaxed px-4",
									pendingUpdate && "opacity-0",
									isTextLoading && "selection:bg-primary/20",
									isModifying && "opacity-70",
								)}
								style={{
									caretColor: "var(--primary)",
									...(selectionStyles && {
										"::selection": selectionStyles,
										"::MozSelection": selectionStyles,
									}),
								}}
							/>
							{isAutocompleteEnabled &&
								displayedCompletion &&
								!pendingUpdate && (
									<div
										aria-hidden="true"
										className={cn(
											"absolute flex-1 h-full w-full top-0 left-0 right-0 font-serif pointer-events-none whitespace-pre-wrap",
											isZenMode
												? "leading-relaxed opacity-30 px-4"
												: "text-base w-full opacity-50 px-8",
											isModifying &&
												"after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-primary/10 after:to-transparent after:animate-shine",
										)}
									>
										<span className="whitespace-pre-wrap">
											{input.substring(0, cursorPosition)}
											<span
												className={cn(
													"text-muted-foreground",
													isModifying && "animate-pulse",
												)}
											>
												{displayedCompletion}
											</span>
											{input.substring(cursorPosition)}
										</span>
									</div>
								)}
							{pendingUpdate && (
								<div className="absolute inset-0 flex flex-col">
									<div
										className={cn(
											"absolute flex-1 h-full w-full top-0 left-0 right-0 font-serif",
											isZenMode
												? "text-xl leading-relaxed px-4"
												: "text-lg px-8",
										)}
									>
										<div className="whitespace-pre-wrap">
											<span>
												{input.substring(
													0,
													editorRef.current?.selectionStart ?? 0,
												)}
											</span>

											<InlineDiffView
												originalText={selectedText}
												newText={pendingUpdate}
												className="inline relative"
												onAccept={() => {
													if (editorRef.current) {
														const start = editorRef.current.selectionStart;
														const end = editorRef.current.selectionEnd;
														const newText =
															input.substring(0, start) +
															pendingUpdate +
															input.substring(end);

														// Clean up all states at once
														setInput(newText);
														// Don't update lastManualInput here since this isn't manual input
														setPendingUpdate(null);
														setIsModifying(false);
														setStreamingText("");
														setCompletion("");
														setSelectionPosition(null);
														setSelectedText("");
														setSelectedRange(null);
														setSelectionStyles(null);

														// Reset cursor position
														const newPosition =
															start + (pendingUpdate?.length || 0);
														setCursorPosition(newPosition);
														if (editorRef.current) {
															editorRef.current.selectionStart = newPosition;
															editorRef.current.selectionEnd = newPosition;
														}
													}
												}}
												onReject={() => {
													setPendingUpdate(null);
													setIsModifying(false);
													setStreamingText("");
												}}
											/>

											<span>
												{input.substring(editorRef.current?.selectionEnd ?? 0)}
											</span>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Floating Bottom Bar - Only show when not in Zen mode */}
				{!isZenMode && (
					<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center z-10 w-full max-w-[38rem] px-4">
						<div className="flex items-center space-x-4 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg border shadow-sm w-full justify-center">
							<div className="flex items-center space-x-2">
								<Switch
									id="autocomplete"
									checked={isAutocompleteEnabled}
									onCheckedChange={setIsAutocompleteEnabled}
								/>
								<Label htmlFor="autocomplete">Enable AI</Label>
							</div>
							<Button
								variant="outline"
								size="sm"
								className="flex items-center gap-2"
								onClick={() => {
									setIsZenMode((prev) => !prev);
									if (!isZenMode) {
										setIsAIChatOpen(false);
										// Request full screen when clicking the button
										document.documentElement
											.requestFullscreen()
											.catch((err) => {
												console.log(
													"Error attempting to enable full-screen mode:",
													err,
												);
											});
									} else if (document.fullscreenElement) {
										// Exit full screen when leaving zen mode
										document.exitFullscreen().catch((err) => {
											console.log(
												"Error attempting to exit full-screen mode:",
												err,
											);
										});
									}
								}}
							>
								<Maximize2 className="h-4 w-4" />
								<span>Zen Mode</span>
								<kbd className="text-foreground inline-flex h-5 max-h-full items-center rounded border bg-muted px-1 font-mono text-[0.625rem] font-medium ml-2">
									⌘J
								</kbd>
							</Button>

							<Button
								variant="outline"
								size="sm"
								className="flex items-center gap-2"
								onClick={() => setIsAIChatOpen((prev) => !prev)}
							>
								<MessageSquare className="h-4 w-4" />
								<span>AI Chat</span>
								<kbd className="text-foreground inline-flex h-5 max-h-full items-center rounded border bg-muted px-1 font-mono text-[0.625rem] font-medium ml-2">
									⌘O
								</kbd>
							</Button>

							<Dialog>
								<DialogTrigger asChild>
									<Button
										variant="outline"
										size="sm"
										className="flex items-center gap-2"
									>
										<Upload className="h-4 w-4" />
										Upload
									</Button>
								</DialogTrigger>
								<DialogContent className="sm:max-w-md" title="Upload Files">
									<DialogHeader>
										<h3 className="text-lg font-semibold">Upload Files</h3>
										<p className="text-sm text-muted-foreground">
											Upload your files using drag & drop or file selection
										</p>
									</DialogHeader>
									<div className="grid gap-6 py-4">
										<div className="flex items-center gap-4">
											<FileText className="w-8 h-8 text-muted-foreground" />
											<div className="flex-1 grid gap-1.5">
												<div className="text-sm font-medium">
													Supported formats
												</div>
												<div className="text-xs text-muted-foreground">
													CSV, TXT, PDF, DOCX, XLSX, PPTX (Max 16MB)
												</div>
											</div>
										</div>
										<Separator />
										<ScrollArea className="h-[300px] rounded-md border p-4">
											<UploadDropzone
												endpoint="documentUploader"
												onClientUploadComplete={() => {
													toast.success("File uploaded successfully");
												}}
												onUploadError={(error: Error) => {
													toast.error(`ERROR! ${error.message}`);
												}}
												className="ut-upload-dropzone:bg-muted ut-button:bg-primary ut-button:text-primary-foreground ut-button:hover:bg-primary/90 ut-button:transition-colors ut-allowed-content:text-muted-foreground/80 ut-label:text-foreground/80 ut-upload-icon:text-muted-foreground/50"
												appearance={{
													container:
														"flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 transition-colors hover:border-muted-foreground/50",
													label:
														"flex flex-col items-center justify-center gap-2 text-sm font-medium",
													allowedContent: "text-xs mt-4",
													button: ({ ready }) => ({
														backgroundColor: ready
															? "var(--primary)"
															: "var(--muted)",
														color: ready
															? "var(--primary-foreground)"
															: "var(--muted-foreground)",
														transition: "background-color 150ms ease",
													}),
												}}
												content={{
													label: ({ ready, isUploading }) => (
														<>
															<Upload
																className={cn(
																	"h-10 w-10",
																	isUploading
																		? "animate-pulse"
																		: "animate-bounce",
																)}
															/>
															<span className="text-base">
																{isUploading
																	? "Uploading..."
																	: ready
																		? "Drop your files here or click to browse"
																		: "Getting ready..."}
															</span>
														</>
													),
													allowedContent: ({ ready, fileTypes }) =>
														ready ? (
															<span>
																Supported formats: {fileTypes.join(", ")}
															</span>
														) : null,
													button: ({ ready }) => (
														<span className="flex items-center gap-2">
															<Upload className="h-4 w-4" />
															{ready ? "Select Files" : "Preparing..."}
														</span>
													),
												}}
											/>
										</ScrollArea>
									</div>
								</DialogContent>
							</Dialog>
						</div>
					</div>
				)}
			</div>

			{/* AI Chat Sidebar - Only show when not in Zen mode */}
			{isAIChatOpen && !isZenMode && (
				<div className="group/sidebar-wrapper has-[data-side=right]:ml-0">
					<AIChatSidebar
						content={input}
						isEnabled={isAutocompleteEnabled}
						onEnableChange={setIsAutocompleteEnabled}
						onPendingUpdate={setPendingUpdate}
					/>
				</div>
			)}

			{/* Text Selection Menu */}
			{selectedText && selectionPosition && !isZenMode && (
				<div
					className="fixed z-[100]"
					style={{
						left: `${selectionPosition.x}px`,
						top: `${selectionPosition.y}px`,
						transform: "translate(-50%, 0)",
					}}
				>
					<TextSelectionMenu
						selectedText={selectedText}
						onModify={handleModifyText}
						model={model}
						onPendingUpdate={setPendingUpdate}
						onOpenChange={handleDropdownOpen}
						isLoading={isModifying}
						onModificationStart={handleModificationStart}
					/>
				</div>
			)}
		</div>
	);
}

function parseCompletion(completion: string | undefined, input: string) {
	if (!completion) return "";
	const startTag = "<completion>";
	const endTag = "</completion>";
	if (completion.startsWith(startTag) && completion.includes(endTag)) {
		const startIndex = startTag.length;
		const endIndex = completion.indexOf(endTag);
		let result = completion.substring(startIndex, endIndex);
		if (input.endsWith(" ") && result.startsWith(" ")) {
			result = result.trimStart();
		}
		return result;
	}
	return "";
}
