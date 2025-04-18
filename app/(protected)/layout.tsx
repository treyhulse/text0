import { MinimalIntegrationSidebar } from "@/components/integration-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { getSecureUser } from "@/lib/auth/server";
import {
	DOCUMENT_KEY,
	type Document,
	USER_DOCUMENTS_KEY,
	redis,
} from "@/lib/redis";

export default async function ProtectedLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const user = await getSecureUser();

	const documentsWithIds = await redis.zrange<string[]>(
		USER_DOCUMENTS_KEY(user.id),
		0,
		-1,
	);
	const _documents = await Promise.all(
		documentsWithIds.map((documentId) =>
			redis.hgetall<Document>(DOCUMENT_KEY(documentId)),
		),
	);
	const documents = _documents
		.map((document) => document as Document)
		.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		);

	return (
		<SidebarProvider defaultOpen={true}>
			<div className="flex h-screen w-full">
				<MinimalIntegrationSidebar documents={documents} />
				<main className="w-full flex-1 overflow-auto">{children}</main>
			</div>
		</SidebarProvider>
	);
}
