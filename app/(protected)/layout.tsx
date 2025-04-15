import { MinimalIntegrationSidebar } from "@/components/integration-sidebar";
import {
  DOCUMENT_KEY,
  type Document,
  USER_DOCUMENTS_KEY,
  redis,
} from "@/lib/redis";
import { getSecureUser } from "@/lib/auth/server";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSecureUser();

  const documentsWithIds = await redis.zrange<string[]>(
    USER_DOCUMENTS_KEY(user.id),
    0,
    -1
  );
  const _documents = await Promise.all(
    documentsWithIds.map((documentId) =>
      redis.hgetall<Document>(DOCUMENT_KEY(documentId))
    )
  );
  const documents = _documents.map((document) => document as Document);

  return (
    <div className="flex w-full h-screen">
      <MinimalIntegrationSidebar documents={documents} />
      <main className="flex-1 w-full overflow-auto">{children}</main>
    </div>
  );
}
