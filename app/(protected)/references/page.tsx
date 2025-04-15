import { AddReference } from "@/components/add-reference";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSecureSession } from "@/lib/auth/server";
import {
  REFERENCE_KEY,
  type Reference,
  USER_REFERENCES_KEY,
  redis,
} from "@/lib/redis";
import { ArrowRight, FileText } from "lucide-react";

interface Document {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
  chunks: number;
}

async function getReferences(userId: string): Promise<Reference[]> {
  // Get all document IDs for the user
  const referenceIds = await redis.smembers(USER_REFERENCES_KEY(userId));

  // Fetch details for each document
  const documents = await Promise.all(
    referenceIds.map(async (referenceId) => {
      const referenceInfo = await redis.hgetall(REFERENCE_KEY(referenceId));
      return {
        id: referenceId,
        ...referenceInfo,
      } as Reference;
    }),
  );

  // Sort documents by upload date (newest first)
  documents.sort(
    (a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
  );

  return documents;
}

export default async function FilesPage() {
  const session = await getSecureSession();
  if (!session.userId) {
    return null;
  }

  const references = await getReferences(session.userId);

  return (
    <div className="container px-4 pb-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-medium text-sm tracking-wide">My References</h2>
          </div>
          <AddReference />
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {references.map((reference) => (
            <a
              key={reference.id}
              href={reference.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-lg border bg-card p-4 shadow-sm transition-all hover:border-primary/20 hover:shadow-md"
            >
              {reference.processed ? (
                <div className="inline-flex w-fit items-center rounded-md border border-border/40 bg-background/40 px-2 py-0.5 font-medium text-foreground/80 text-xs">
                  {reference.chunksCount} chunks
                </div>
              ) : (
                <div className="inline-flex w-fit items-center rounded-md border border-border/40 bg-background/40 px-2 py-0.5 font-medium text-foreground/80 text-xs">
                  Processing...
                </div>
              )}
              <h3 className="mt-2 mb-2 font-medium text-base transition-colors group-hover:text-primary">
                {reference.name}
              </h3>
              <div className="mt-auto flex items-center justify-between pt-3 text-muted-foreground text-sm">
                <span>
                  {new Date(reference.uploadedAt).toLocaleDateString()}
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </a>
          ))}
        </div>

        {references.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No References Yet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Upload your first reference to get started. We support various
                file formats including PDF, DOCX, and more.
              </p>
              <div className="mt-4">
                <AddReference />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
