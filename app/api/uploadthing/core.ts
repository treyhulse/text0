import { Firecrawl } from "@/lib/firecrawls";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { vector } from "@/lib/vector";
import { nanoid } from "@/lib/nanoid";
import { auth } from "@clerk/nextjs/server";
import { redis, USER_DOCUMENTS_KEY, DOCUMENT_KEY } from "@/lib/redis";

const f = createUploadthing();
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  contentUploader: f({
    pdf: {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
    text: {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
    "text/markdown": {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
    "text/plain": {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      {
        maxFileSize: "16MB",
        maxFileCount: 1,
      },
  })
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const { userId } = await auth();

      // If you throw, the user will not be able to upload
      if (!userId) throw new UploadThingError("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const response = await Firecrawl.scrapeUrl(file.ufsUrl, {
        formats: ["markdown"],
      });

      if (!response.success) {
        console.error("Error scraping URL:", response.error);
        return {
          uploadedBy: metadata.userId,
          error: response.error,
        };
      }

      if (!response.markdown) {
        console.error("No markdown found");
        return {
          uploadedBy: metadata.userId,
          error: "No markdown found",
        };
      }

      // Create a text splitter
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000, // Adjust based on your needs
        chunkOverlap: 200, // Adjust based on your needs
      });

      // Split the content into chunks
      const chunks = await textSplitter.splitText(response.markdown);

      // Store document information in Redis
      const documentId = nanoid();
      const documentInfo = {
        id: documentId,
        url: file.ufsUrl,
        name: file.name,
        uploadedAt: new Date().toISOString(),
        chunks: chunks.length,
      };

      // Add document to user's document list
      await redis.sadd(USER_DOCUMENTS_KEY(metadata.userId), documentId);
      // Store document details
      await redis.hset(DOCUMENT_KEY(documentId), documentInfo);

      await vector.upsert(
        chunks.map((chunk) => ({
          id: nanoid(),
          data: chunk,
          metadata: {
            userId: metadata.userId,
            documentId: documentId,
          },
        }))
      );

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return {
        uploadedBy: metadata.userId,
        chunks: chunks,
        documentId: documentId,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
