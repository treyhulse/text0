import React from "react";
import { diffWords } from "diff";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

interface InlineDiffViewProps {
	originalText: string;
	newText: string;
	className?: string;
	onAccept: () => void;
	onReject: () => void;
	isZenMode?: boolean;
}

export function InlineDiffView({
	originalText,
	newText,
	className,
	onAccept,
	onReject,
	isZenMode,
}: InlineDiffViewProps) {
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
							"inline",
							part.added && "text-green-500 bg-green-500/10",
							part.removed && "text-red-500 line-through bg-red-500/10",
							!part.added && !part.removed && "text-foreground",
						)}
					>
						{part.value}
					</span>
				))}
			</div>
			<div className="flex items-center gap-1.5 self-end">
				<Button
					size="sm"
					variant="destructive"
					className="h-7 px-2"
					onClick={onReject}
				>
					<X className="h-3.5 w-3.5" />
				</Button>
				<Button
					size="sm"
					variant="default"
					className="h-7 px-2"
					onClick={onAccept}
				>
					<Check className="h-3.5 w-3.5" />
				</Button>
			</div>
		</div>
	);
}
