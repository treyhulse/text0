import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { diffWords } from "diff";
import { Check, X } from "lucide-react";

interface InlineDiffViewProps {
	originalText: string;
	newText: string;
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
}: Readonly<InlineDiffViewProps>) {
	// Use streaming text while loading, otherwise use final newText
	const diff = diffWords(originalText, newText);

	return (
		<div className={cn("flex w-full flex-col gap-2", className)}>
			<div
				className={cn(
					"whitespace-pre-wrap font-serif text-lg",
					isZenMode && "text-xl leading-relaxed",
				)}
			>
				{diff.map((part, i) => (
					<span
						key={`${i}-${part.value.slice(0, 10)}`}
						className={cn(
							"inline transition-colors duration-200",
							part.added && "bg-success/20 text-success",
							part.removed && "bg-destructive/20 text-destructive line-through",
							!part.added && !part.removed && "text-foreground",
						)}
					>
						{part.value}
					</span>
				))}
				{isLoading && (
					<span className="ml-0.5 inline-block h-4 w-1 animate-pulse bg-primary/80">
						▋
					</span>
				)}
			</div>
			<div className="mt-2 flex w-full items-center gap-1.5 self-end">
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
