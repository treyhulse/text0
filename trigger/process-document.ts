import { task, logger } from "@trigger.dev/sdk/v3";
import { Firecrawl } from "@/lib/firecrawl";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { vector } from "@/lib/vector";
import { nanoid } from "@/lib/nanoid";
import { redis, REFERENCE_KEY, type Reference } from "@/lib/redis";

export const processReferenceTask = task({
  id: "process-reference",
  maxDuration: 300, // 5 minutes
  run: async (payload: { userId: string; referenceId: string }) => {
    const { userId, referenceId } = payload;

    const referenceInfo = await redis.hgetall<Reference>(
      REFERENCE_KEY(referenceId)
    );

    if (!referenceInfo) {
      throw new Error(`Reference not found: ${referenceId}`);
    }

    // Scrape the reference content
    const response = await Firecrawl.scrapeUrl(referenceInfo.url, {
      formats: ["markdown"],
      timeout: 200000,
    });

    if (!response.success) {
      throw new Error(`Error scraping URL: ${response.error}`);
    }

    logger.info("Scraped document", JSON.parse(JSON.stringify(response)));

    if (!response.markdown) {
      throw new Error("No markdown found in document");
    }
    logger.info(`Scraped document: ${referenceInfo.url}`);

    // Create a text splitter
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    // Split the content into chunks
    const chunks = await textSplitter.splitText(response.markdown);
    logger.info(`Split document into ${chunks.length} chunks`);

    // Store chunks in vector database
    await vector.upsert(
      chunks.map((chunk) => ({
        id: nanoid(),
        data: chunk,
        metadata: {
          userId: userId,
          referenceId: referenceId,
        },
      }))
    );
    logger.info(`Upserted ${chunks.length} chunks into vector database`);

    const info = {
      ...referenceInfo,
      chunksCount: chunks.length,
      processed: true,
    } satisfies Reference;

    if (response.metadata?.title) {
      info.name = response.metadata.title;
    }

    if (response.title) {
      info.name = response.title;
    }

    await redis.hset(REFERENCE_KEY(referenceId), info);

    logger.info(`Processed document: ${referenceInfo.url}`);

    return {
      referenceId,
      chunks: chunks.length,
    };
  },
});
