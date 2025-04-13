import { task } from "@trigger.dev/sdk/v3";
import { Firecrawl } from "@/lib/firecrawls";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { vector } from "@/lib/vector";
import { nanoid } from "@/lib/nanoid";
import { redis, USER_DOCUMENTS_KEY, DOCUMENT_KEY } from "@/lib/redis";

export const processDocumentTask = task({
  id: "process-document",
  maxDuration: 300, // 5 minutes
  run: async (payload: {
    userId: string;
    fileUrl: string;
    fileName: string;
  }) => {
    const { userId, fileUrl, fileName } = payload;

    // Scrape the document content
    const response = await Firecrawl.scrapeUrl(fileUrl, {
      formats: ["markdown"],
    });

    if (!response.success) {
      throw new Error(`Error scraping URL: ${response.error}`);
    }

    if (!response.markdown) {
      throw new Error("No markdown found in document");
    }

    // Create a text splitter
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    // Split the content into chunks
    const chunks = await textSplitter.splitText(response.markdown);

    // Store document information in Redis
    const documentId = nanoid();
    const documentInfo = {
      id: documentId,
      url: fileUrl,
      name: fileName,
      uploadedAt: new Date().toISOString(),
      chunks: chunks.length,
    };

    // Add document to user's document list
    await redis.sadd(USER_DOCUMENTS_KEY(userId), documentId);
    // Store document details
    await redis.hset(DOCUMENT_KEY(documentId), documentInfo);

    // Store chunks in vector database
    await vector.upsert(
      chunks.map((chunk) => ({
        id: nanoid(),
        data: chunk,
        metadata: {
          userId: userId,
          documentId: documentId,
        },
      }))
    );

    return {
      documentId,
      chunks: chunks.length,
    };
  },
});
