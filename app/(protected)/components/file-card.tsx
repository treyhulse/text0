"use client";

import { FileText, ExternalLink, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { Document, Reference } from "@/lib/redis";

interface FileCardProps {
	file: Document | Reference;
	type: "document" | "reference";
	isSelected?: boolean;
	onSelect?: (selected: boolean) => void;
}

export function FileCard({ file, type, isSelected, onSelect }: FileCardProps) {
	const isReference = type === "reference";
	const ref = file as Reference;
	const doc = file as Document;

	return (
		<div
			className={cn(
				"group relative flex items-center gap-3 rounded-lg border bg-card p-3 transition-all hover:bg-accent/50",
				isSelected && "bg-accent",
			)}
		>
			<Checkbox
				checked={isSelected}
				onCheckedChange={onSelect}
				className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 data-[state=checked]:opacity-100"
			/>

			<div className="flex-1 pl-6">
				{isReference ? (
					<>
						<div className="mb-1 flex items-center justify-between">
							<div className="flex items-center gap-2">
								<span className="font-medium">
									{ref.name || ref.filename || "Untitled"}
								</span>
								{ref.processed ? (
									<Badge
										variant="default"
										className="bg-green-500/10 text-green-500 hover:bg-green-500/20"
									>
										<CheckCircle2 className="mr-1 h-3 w-3" />
										Processed
									</Badge>
								) : (
									<Badge
										variant="secondary"
										className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
									>
										<XCircle className="mr-1 h-3 w-3" />
										Processing
									</Badge>
								)}
							</div>
							<Link
								href={ref.url}
								target="_blank"
								rel="noopener noreferrer"
								className="text-sm text-muted-foreground opacity-0 transition-opacity hover:text-primary group-hover:opacity-100"
							>
								<ExternalLink className="h-4 w-4" />
							</Link>
						</div>
						<div className="flex items-center gap-4 text-sm text-muted-foreground">
							<span>{ref.chunksCount} chunks</span>
							<span>{new Date(ref.uploadedAt).toLocaleDateString()}</span>
						</div>
					</>
				) : (
					<>
						<div className="mb-1 flex items-center justify-between">
							<Link
								href={`/docs/${doc.id}`}
								className="font-medium hover:text-primary"
							>
								{doc.name}
							</Link>
							<span className="text-sm text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
								{new Date(doc.createdAt).toLocaleDateString()}
							</span>
						</div>
						<div className="line-clamp-1 text-sm text-muted-foreground">
							{doc.content}
						</div>
					</>
				)}
			</div>
		</div>
	);
}
