import {
	FileText,
	Plus,
	Upload,
	Search,
	BugOffIcon,
	ExternalLink,
	BrainIcon,
} from "lucide-react";
import Link from "next/link";

import {
	DOCUMENT_KEY,
	type Document,
	USER_REFERENCES_KEY,
	USER_DOCUMENTS_KEY,
	REFERENCE_KEY,
	redis,
	type Reference,
} from "@/lib/redis";
import { getSecureUser } from "@/lib/auth/server";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
	const user = await getSecureUser();

	// Fetch documents and references
	const documentsWithIds = await redis.zrange<string[]>(
		USER_DOCUMENTS_KEY(user.id),
		0,
		-1,
	);
	const referencesWithIds = await redis.smembers(USER_REFERENCES_KEY(user.id));

	const [documents, references] = await Promise.all([
		Promise.all(
			documentsWithIds.map((id) => redis.hgetall<Document>(DOCUMENT_KEY(id))),
		),
		Promise.all(
			referencesWithIds.map((id) =>
				redis.hgetall<Reference>(REFERENCE_KEY(id)),
			),
		),
	]);

	const validDocuments = documents.filter(
		(doc): doc is Document => doc !== null,
	);
	const validReferences = references.filter(
		(ref): ref is Reference => ref !== null,
	);

	// Combine and sort by date
	console.log(validDocuments);
	const allFiles = [
		...validDocuments.map((doc) => ({ ...doc, type: "document" as const })),
		...validReferences.map((ref) => ({ ...ref, type: "reference" as const })),
	]
		.sort((a, b) => {
			const dateA = new Date(
				a.type === "document" ? a.createdAt : a.uploadedAt,
			);
			const dateB = new Date(
				b.type === "document" ? b.createdAt : b.uploadedAt,
			);
			return dateA.getTime() - dateB.getTime();
		})
		.slice(0, 5); // Limit to 5 most recent items

	return (
		<div className="flex h-screen flex-col bg-background text-foreground">
			{/* Main Content */}
			<main className="flex-1 flex items-center justify-center overflow-auto">
				<div className="container my-auto mx-auto max-w-2xl px-4 py-12">
					{/* App Title */}
					<div className="mb-8 flex items-start justify-start gap-4">
						<div className="p-3 rounded-lg bg-primary/10">
							<BugOffIcon className="h-8 w-8 text-primary" />
						</div>
						<div className="flex flex-col gap-1">
							<h1 className="text-2xl font-semibold tracking-tight">text0</h1>
							<p className="text-sm text-muted-foreground">
								Your documents and memories in one place
							</p>
						</div>
					</div>

					{/* Quick Actions */}
					<div className="mb-8 grid grid-cols-3 gap-3">
						<Button
							variant="outline"
							className="group flex h-[80px] flex-col items-start justify-center gap-3 rounded-lg border border-border bg-background px-6 hover:border-border hover:bg-background"
						>
							<FileText className="h-4 w-4" />
							<span className="text-sm font-medium">New Document</span>
						</Button>
						<Button
							variant="outline"
							className="group flex h-[80px] flex-col items-start justify-center gap-3 rounded-lg border border-border bg-background px-6 hover:border-border hover:bg-background"
						>
							<BrainIcon className="h-4 w-4" />
							<span className="text-sm font-medium">New Memory</span>
						</Button>
						<Button
							variant="outline"
							className="group flex h-[80px] flex-col items-start justify-center gap-3 rounded-lg border border-border bg-background px-6 hover:border-border hover:bg-background"
						>
							<Search className="h-4 w-4" />
							<span className="text-sm font-medium">Search</span>
						</Button>
					</div>

					{/* Files List */}
					<div className="overflow-hidden rounded-lg border border-border">
						<div className="grid divide-y divide-border">
							{allFiles.map((file) =>
								file.type === "document" ? (
									<Link
										href={`/docs/${file.id}`}
										key={file.id}
										className="flex items-center gap-3 bg-background p-4 hover:bg-muted/50 transition-colors"
									>
										<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-border/40 bg-blue-500/5 text-blue-500">
											<FileText className="h-4 w-4" />
										</div>
										<div className="flex min-w-0 flex-1 flex-col justify-between">
											<div>
												<h3 className="truncate text-[15px] font-medium">
													{file.name}
												</h3>
											</div>
											<div className="flex flex-col gap-0.5">
												<p className="text-xs text-muted-foreground">
													{new Date(file.createdAt).toLocaleDateString()}
												</p>
											</div>
										</div>
										<p className="truncate text-xs text-muted-foreground max-w-[200px]">
											{file.content}
										</p>
									</Link>
								) : (
									<a
										href={file.url}
										target="_blank"
										rel="noopener noreferrer"
										key={file.id}
										className="flex items-center gap-3 bg-background p-4 hover:bg-muted/50 transition-colors"
									>
										<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-border/40 bg-purple-500/5 text-purple-500">
											<BrainIcon className="h-4 w-4" />
										</div>
										<div className="flex min-w-0 flex-1 flex-col justify-between">
											<div>
												<h3 className="truncate text-[15px] font-medium">
													{file.name || file.filename || "Untitled"}
												</h3>
											</div>
											<div className="flex flex-col gap-0.5">
												<p className="text-xs text-muted-foreground">
													{new Date(file.uploadedAt).toLocaleDateString()}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-1 text-xs text-muted-foreground">
											<span className="truncate max-w-[180px]">
												{file.url?.replace(/^https?:\/\//, "").split("/")[0]}
											</span>
											<ExternalLink className="h-3 w-3" />
										</div>
									</a>
								),
							)}
						</div>
					</div>
				</div>
			</main>

			{/* Status Bar */}
			<footer className="border-t border-border/40 bg-background">
				<div className="container mx-auto flex h-8 max-w-2xl items-center justify-between px-4">
					<div className="flex items-center gap-4 text-xs text-muted-foreground">
						<span>{validReferences.length} references</span>
						<span>{validDocuments.length} documents</span>
					</div>
					<div className="text-xs text-muted-foreground">
						{user.fullName} • text0
					</div>
				</div>
			</footer>
		</div>
	);
}
