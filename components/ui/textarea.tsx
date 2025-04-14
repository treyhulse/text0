import * as React from "react";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useCallback } from "react";

export interface TextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	autoResize?: boolean;
	maxRows?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, autoResize = true, maxRows = 8, onChange, ...props }, ref) => {
		const textareaRef = useRef<HTMLTextAreaElement | null>(null);

		const handleResize = useCallback(
			(target: HTMLTextAreaElement) => {
				if (!autoResize) return;

				target.style.height = "0";
				const newHeight = Math.min(
					target.scrollHeight,
					maxRows * Number.parseInt(getComputedStyle(target).lineHeight),
				);
				target.style.height = `${newHeight}px`;
			},
			[autoResize, maxRows],
		);

		const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
			if (autoResize) {
				handleResize(e.target);
			}
			onChange?.(e);
		};

		useEffect(() => {
			const textarea = textareaRef.current;
			if (textarea && autoResize) {
				handleResize(textarea);
				// Resize on window resize
				const resizeObserver = new ResizeObserver(() => handleResize(textarea));
				resizeObserver.observe(textarea);
				return () => resizeObserver.disconnect();
			}
		}, [autoResize, handleResize]);

		return (
			<textarea
				ref={(element) => {
					// Handle both refs
					if (typeof ref === "function") {
						ref(element);
					} else if (ref) {
						ref.current = element;
					}
					textareaRef.current = element;
				}}
				className={cn(
					"flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
					"ring-offset-background placeholder:text-muted-foreground",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
					"disabled:cursor-not-allowed disabled:opacity-50",
					"transition-colors duration-200",
					"resize-none overflow-hidden",
					className,
				)}
				onChange={handleChange}
				{...props}
			/>
		);
	},
);
Textarea.displayName = "Textarea";

export { Textarea };
