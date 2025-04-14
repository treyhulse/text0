import React from "react";
import type { Change } from "diff";
import { diffLines, diffWords } from "diff";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TextDiffViewProps {
	originalText: string;
	newText: string;
	onAccept: () => void;
	onReject: () => void;
	className?: string;
}

export function TextDiffView({
	originalText,
	newText,
	onAccept,
	onReject,
	className,
}: TextDiffViewProps) {
	// Normalize line endings and remove extra empty lines
	const normalizeText = (text: string) => {
		return text
			.replace(/\r\n/g, "\n") // Normalize line endings
			.replace(/\n{3,}/g, "\n\n") // Replace 3+ newlines with 2
			.trim(); // Remove leading/trailing whitespace
	};

	const diff = diffLines(normalizeText(originalText), normalizeText(newText), {
		newlineIsToken: true,
		ignoreWhitespace: true,
	});

	// Calculate the total number of lines for padding
	const totalLines = diff.reduce((acc, part) => {
		if (!part.removed) {
			// Only count non-removed lines
			return acc + part.value.split("\n").filter((line) => line !== "").length;
		}
		return acc;
	}, 0);

	return (
		<div
			className={cn(
				"relative rounded-lg border bg-background/95 shadow-lg overflow-hidden font-mono text-sm",
				className,
			)}
		>
			<div className="absolute right-2 top-2 flex items-center gap-1 z-10">
				<Button
					size="sm"
					variant="ghost"
					className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/30"
					onClick={onAccept}
				>
					<Check className="h-4 w-4" />
				</Button>
				<Button
					size="sm"
					variant="ghost"
					className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
					onClick={onReject}
				>
					<X className="h-4 w-4" />
				</Button>
			</div>
			<div className="p-4 pt-8">
				{(() => {
					let lineNumber = 1;
					return diff.map((part: Change, index: number) => {
						// Split the content into lines and filter out empty lines from regular line breaks
						const lines = part.value.split("\n");
						const lastLineIndex = lines.length - 1;

						return lines
							.map((line, lineIndex) => {
								// Skip empty lines that are just regular line breaks
								if (line === "" && lineIndex !== lastLineIndex) {
									return null;
								}

								// Only increment line number for non-removed lines with content
								const currentLineNumber = part.removed
									? "-"
									: part.added
										? `+${lineNumber}`
										: lineNumber;

								// Increment line number only if this is a real line with content
								if (
									!part.removed &&
									(line !== "" || lineIndex === lastLineIndex)
								) {
									lineNumber++;
								}

								const words = diffWords(line, line);

								const bgColor = part.added
									? "bg-green-100/30 dark:bg-green-900/20"
									: part.removed
										? "bg-red-100/30 dark:bg-red-900/20"
										: "";

								const gutterColor = part.added
									? "text-green-700 dark:text-green-400 border-green-600 dark:border-green-500"
									: part.removed
										? "text-red-700 dark:text-red-400 border-red-600 dark:border-red-500"
										: "text-muted-foreground/50 border-transparent";

								const textColor = part.added
									? "text-green-900 dark:text-green-300"
									: part.removed
										? "text-red-900 dark:text-red-300"
										: "";

								return (
									<div
										key={`${currentLineNumber}-${line}-${part.added ? "added" : part.removed ? "removed" : "unchanged"}`}
										className={cn(
											"flex items-start group hover:bg-muted/50 transition-colors min-h-[1.5rem]",
											bgColor,
										)}
									>
										<div
											className={cn(
												"w-12 flex-none px-2 text-right select-none border-r-2",
												gutterColor,
											)}
										>
											{currentLineNumber}
										</div>
										<div
											className={cn("px-4 flex-1 whitespace-pre", textColor)}
										>
											{words.map((word, wordIndex) => {
												const isChanged =
													(part.added && word.added) ||
													(part.removed && word.removed);
												return (
													<span
														key={`${wordIndex}-${word.value}`}
														className={cn(
															isChanged &&
																part.added &&
																"bg-green-200/50 dark:bg-green-300/20",
															isChanged &&
																part.removed &&
																"bg-red-200/50 dark:bg-red-300/20",
														)}
													>
														{word.value}
													</span>
												);
											})}
										</div>
									</div>
								);
							})
							.filter(Boolean);
					});
				})()}
			</div>
		</div>
	);
}
