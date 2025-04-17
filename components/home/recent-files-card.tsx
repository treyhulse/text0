import { BrainIcon, ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import type { Document, Reference } from "@/lib/redis";

type FileItem =
	| (Document & { type: "document" })
	| (Reference & { type: "reference" });

interface RecentFilesCardProps {
	files: FileItem[];
}

export function RecentFilesCard({ files }: RecentFilesCardProps) {
	return (
		<div className="overflow-hidden rounded-lg border border-border">
			<div className="grid divide-y divide-border">
				{files.map((file) =>
					file.type === "document" ? (
						<Link
							href={`/docs/${file.id}`}
							key={file.id}
							className="relative flex items-start gap-3 bg-background p-4 transition-colors hover:bg-muted/50"
						>
							<div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-border/40 bg-blue-500/5 text-blue-500">
								<FileText className="h-4 w-4" />
							</div>
							<div className="flex grow justify-between">
								<div className="grow pr-16">
									<h3 className="truncate font-medium text-[15px]">
										{file.name}
									</h3>
									<p className="text-muted-foreground text-xs ">
										{file.content.slice(0, 200)}...
									</p>
								</div>
								<div className="absolute right-4 bottom-4">
									<p className="text-muted-foreground text-xs">
										{new Date(file.createdAt).toLocaleDateString()}
									</p>
								</div>
							</div>
						</Link>
					) : (
						<a
							href={file.url}
							target="_blank"
							rel="noopener noreferrer"
							key={file.id}
							className="items-top relative flex gap-3 bg-background p-4 transition-colors hover:bg-muted/50"
						>
							<div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-border/40 bg-purple-500/5 text-purple-500">
								<BrainIcon className="h-4 w-4" />
							</div>
							<div className="flex grow justify-between">
								<div className="grow pr-16">
									<h3 className="text-balance font-medium text-[15px]">
										{file.name ?? file.filename ?? "Untitled"}
										<ExternalLink className="ml-1 inline-block h-3 w-3" />
									</h3>
								</div>
								<div className="absolute right-4 bottom-4">
									<p className="text-muted-foreground text-xs">
										{new Date(file.uploadedAt).toLocaleDateString()}
									</p>
								</div>
							</div>
						</a>
					),
				)}
			</div>
		</div>
	);
}
