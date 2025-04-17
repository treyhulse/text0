"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useReferences } from "@/hooks/use-references";
import { useReferenceProcessing } from "@/hooks/use-reference-processing";
import { useSelectedReferences } from "@/hooks/use-selected-references";
import type { Reference } from "@/lib/redis";
import { AlertCircle, CheckCircle, ExternalLink, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function ReferenceSelector() {
	const { doc_id } = useParams();
	const { data: references, isLoading, refetch } = useReferences();
	const { processingStatus } = useReferenceProcessing(references);
	const { isReferenceSelected, toggleReference } = useSelectedReferences(
		doc_id as string,
	);
	const [recentlyAdded, setRecentlyAdded] = useState<string[]>([]);

	// Monitor localStorage for changes in references (when a new reference is added)
	useEffect(() => {
		const checkForNewReferences = () => {
			refetch();
		};

		// Set up event listener for storage events
		window.addEventListener("storage", checkForNewReferences);

		// Also check periodically
		const interval = setInterval(checkForNewReferences, 3000);

		return () => {
			window.removeEventListener("storage", checkForNewReferences);
			clearInterval(interval);
		};
	}, [refetch]);

	// Watch for changes in references to identify newly added ones
	useEffect(() => {
		if (!references || !Array.isArray(references)) return;

		// Compare references with the previously rendered list
		const newReferences = references
			.filter((ref) => {
				// Consider a reference new if it was added in the last 5 seconds
				const uploadTime = ref.uploadedAt
					? new Date(ref.uploadedAt).getTime()
					: 0;
				const now = Date.now();
				return now - uploadTime < 5000;
			})
			.map((ref) => ref.id);

		// If we found new references
		if (newReferences.length > 0) {
			setRecentlyAdded((prev) => [...prev, ...newReferences]);

			// Show a toast notification
			if (newReferences.length === 1) {
				const newRef = references.find((ref) => ref.id === newReferences[0]);
				toast.success(
					`Added reference: ${newRef?.name || newRef?.filename || "Document"}`,
				);
			} else {
				toast.success(`Added ${newReferences.length} new references`);
			}

			// Clear the "recently added" highlight after 5 seconds
			setTimeout(() => {
				setRecentlyAdded((prev) =>
					prev.filter((id) => !newReferences.includes(id)),
				);
			}, 5000);
		}
	}, [references]);

	if (isLoading) {
		return (
			<div className="h-[250px] space-y-1 p-1">
				<Skeleton className="h-8 w-full" />
				<Skeleton className="h-8 w-full" />
				<Skeleton className="h-8 w-full" />
			</div>
		);
	}

	return (
		<ScrollArea className="h-[250px] space-y-1 rounded-md border p-1">
			{references?.map((reference: Reference) => {
				const processing = processingStatus[reference.id];
				const isProcessing = processing?.isProcessing;
				const progress = processing?.progress;
				const hasError = !!processing?.error;

				return (
					<div
						key={reference.id}
						className={`flex items-center gap-2 rounded-md px-2 py-1 transition-colors duration-200 ${
							recentlyAdded.includes(reference.id)
								? "bg-primary/10 animate-pulse"
								: "hover:bg-accent"
						}`}
					>
						<Checkbox
							id={reference.id}
							checked={isReferenceSelected(reference.id)}
							onCheckedChange={() => toggleReference(reference.id)}
							disabled={isProcessing}
						/>
						<div className="flex-1">
							<label
								htmlFor={reference.id}
								className="group flex items-center text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
							>
								{reference.name ?? reference.filename}
								<Button
									variant="ghost"
									size="icon"
									className="ml-1 size-4 opacity-0 transition-opacity group-hover:opacity-100"
									asChild
									aria-label={`Open ${
										reference.name ?? reference.filename
									} in new tab`}
								>
									<a
										href={reference.url}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={`Open ${
											reference.name ?? reference.filename
										} in new tab`}
									>
										<ExternalLink className="h-4 w-4" />
									</a>
								</Button>
							</label>

							{/* Processing indicator */}
							{isProcessing && (
								<div className="mt-0.5">
									<div className="flex items-center text-xs text-muted-foreground">
										<Loader2 className="h-3 w-3 mr-1 animate-spin" />
										<span>{processing.status || "Processing..."}</span>
									</div>
									{typeof progress === "number" && (
										<Progress
											value={progress}
											className="h-1 mt-1"
											aria-label="Processing progress"
										/>
									)}
								</div>
							)}

							{/* Error indicator */}
							{hasError && (
								<div className="mt-0.5 flex items-center text-xs text-destructive">
									<AlertCircle className="h-3 w-3 mr-1" />
									<span>{processing.error}</span>
								</div>
							)}

							{/* Completed indicator */}
							{!isProcessing && !hasError && processing && (
								<div className="mt-0.5 flex items-center text-xs text-primary">
									<CheckCircle className="h-3 w-3 mr-1" />
									<span>Processing complete</span>
								</div>
							)}
						</div>

						{recentlyAdded.includes(reference.id) && (
							<span className="text-xs text-primary font-medium ml-auto flex items-center">
								new
							</span>
						)}
					</div>
				);
			})}
			{references?.length === 0 && (
				<p className="py-4 text-center text-muted-foreground text-sm">
					No references found. Add some references first.
				</p>
			)}
		</ScrollArea>
	);
}
