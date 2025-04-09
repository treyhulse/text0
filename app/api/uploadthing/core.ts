import { Firecrawl } from "@/lib/firecrawls";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const f = createUploadthing();

const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

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
      const user = auth(req);

      // If you throw, the user will not be able to upload
      if (!user) throw new UploadThingError("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);

      console.log("file url", file.ufsUrl);

      // Start timing the scraping process
      const startTime = performance.now();
      
      const response = await Firecrawl.scrapeUrl(file.ufsUrl, {
        formats: ["markdown"],
      });

      // Calculate and log the scraping duration
      const endTime = performance.now();
      const scrapingDuration = endTime - startTime;
      console.log(`Scraping took ${scrapingDuration.toFixed(2)} milliseconds`);

      console.log("response", response);

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

      console.log("Chunks:", chunks);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { 
        uploadedBy: metadata.userId,
        chunks: chunks,
        scrapingDuration: scrapingDuration 
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
