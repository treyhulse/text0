import { auth } from "@clerk/nextjs/server";
import { FileText, Upload, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { redis, USER_DOCUMENTS_KEY, DOCUMENT_KEY } from "@/lib/redis";

interface Document {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
  chunks: number;
}

async function getDocuments(userId: string): Promise<Document[]> {
  // Get all document IDs for the user
  const documentIds = await redis.smembers(USER_DOCUMENTS_KEY(userId));
  
  // Fetch details for each document
  const documents = await Promise.all(
    documentIds.map(async (documentId) => {
      const documentInfo = await redis.hgetall(DOCUMENT_KEY(documentId));
      return {
        id: documentId,
        ...documentInfo,
      } as Document;
    })
  );

  // Sort documents by upload date (newest first)
  documents.sort((a, b) => 
    new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );

  return documents;
}

export default async function FilesPage() {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  const documents = await getDocuments(userId);

  return (
    <div className="container px-4 pb-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium tracking-wide">My Documents</h2>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link
              href="/content-upload"
              className="flex items-center gap-2 text-sm"
            >
              <Upload className="h-4 w-4" />
              Upload Document
            </Link>
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((document) => (
            <a
              key={document.id}
              href={document.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col rounded-lg border bg-card p-4 shadow-sm transition-all hover:border-primary/20 hover:shadow-md"
            >
              <div className="inline-flex w-fit items-center rounded-md border border-border/40 bg-background/40 px-2 py-0.5 text-xs font-medium text-foreground/80">
                {document.chunks} chunks
              </div>
              <h3 className="mb-2 mt-2 text-base font-medium transition-colors group-hover:text-primary">
                {document.name}
              </h3>
              <div className="mt-auto flex items-center justify-between pt-3 text-sm text-muted-foreground">
                <span>
                  {new Date(document.uploadedAt).toLocaleDateString()}
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </a>
          ))}
        </div>

        {documents.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>No Documents Yet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Upload your first document to get started. We support various file
                formats including PDF, DOCX, and more.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/content-upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
