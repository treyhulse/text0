import React from "react";
import { diffWords } from "diff";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface InlineDiffViewProps {
	originalText: string;
	newText: string;
	streamingText?: string;
	isLoading?: boolean;
	className?: string;
	onAccept: () => void;
	onReject: () => void;
	isZenMode?: boolean;
}

export function InlineDiffView({
	originalText,
	newText,
	isLoading,
	className,
	onAccept,
	onReject,
	isZenMode,
}: InlineDiffViewProps) {
	// Use streaming text while loading, otherwise use final newText
	const diff = diffWords(originalText, newText);

	return (
		<div className={cn("flex flex-col gap-2 w-full", className)}>
			<div
				className={cn(
					"font-serif text-lg whitespace-pre-wrap",
					isZenMode && "text-xl leading-relaxed",
				)}
			>
				{diff.map((part, i) => (
					<span
						key={`${i}-${part.value.slice(0, 10)}`}
						className={cn(
							"inline transition-colors duration-200",
							part.added && "text-success bg-success/20",
							part.removed && "text-destructive line-through bg-destructive/20",
							!part.added && !part.removed && "text-foreground",
						)}
					>
						{part.value}
					</span>
				))}
				{isLoading && (
					<span className="inline-block w-1 h-4 bg-primary/80 animate-pulse ml-0.5">
						▋
					</span>
				)}
			</div>
			<div className="flex w-full mt-2 items-center gap-1.5 self-end">
				<Button
					size="sm"
					variant="destructive"
					className="h-7 px-2"
					onClick={onReject}
					disabled={isLoading}
				>
					<X className="h-3.5 w-3.5" />
					<span className="text-xs">Reject</span>
				</Button>
				<Button
					size="sm"
					variant="success"
					className="h-7 px-2"
					onClick={onAccept}
					disabled={isLoading}
				>
					<Check className="h-3.5 w-3.5" />
					<span className="text-xs">Accept</span>
				</Button>
			</div>
		</div>
	);
}
