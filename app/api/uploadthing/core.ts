import { getSecureSession } from "@/lib/auth/server";
import { nanoid } from "@/lib/nanoid";
import {
	REFERENCE_KEY,
	type Reference,
	USER_REFERENCES_KEY,
	redis,
} from "@/lib/redis";
import type { processReferenceTask } from "@/trigger/process-document";
import { tasks } from "@trigger.dev/sdk/v3";
import { type FileRouter, createUploadthing } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
	// Define as many FileRoutes as you like, each with a unique routeSlug
	documentUploader: f({
		pdf: {
			maxFileSize: "4MB",
			maxFileCount: 1,
		},
		text: {
			maxFileSize: "1MB",
			maxFileCount: 1,
		},
		"text/markdown": {
			maxFileSize: "1MB",
			maxFileCount: 1,
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
			maxFileSize: "4MB",
			maxFileCount: 1,
		},
		"text/plain": {
			maxFileSize: "1MB",
			maxFileCount: 1,
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
			maxFileSize: "4MB",
			maxFileCount: 1,
		},
		"application/vnd.openxmlformats-officedocument.presentationml.presentation": {
			maxFileSize: "4MB",
			maxFileCount: 1,
		},
	})
		.middleware(async () => {
			try {
				// This code runs on your server before upload
				const session = await getSecureSession();

				// Add detailed logging for debugging
				console.log("Upload middleware - Session:", {
					userId: session.userId,
					hasSession: !!session,
				});

				// If you throw, the user will not be able to upload
				if (!session.userId) {
					console.error("Upload middleware - No user ID in session");
					throw new UploadThingError("Unauthorized: No user ID found");
				}

				// Whatever is returned here is accessible in onUploadComplete as `metadata`
				return { userId: session.userId };
			} catch (error: any) {
				console.error("Upload middleware error:", error);
				throw new UploadThingError(`Authentication failed: ${error?.message || 'Unknown error'}`);
			}
		})
		.onUploadComplete(async ({ metadata, file }) => {
			try {
				console.log("Upload complete - Starting processing", { metadata, file });
				const referenceId = nanoid();

				await redis.sadd(USER_REFERENCES_KEY(metadata.userId), referenceId);
				await redis.hset(REFERENCE_KEY(referenceId), {
					id: referenceId,
					userId: metadata.userId,
					url: file.url,
					name: file.name,
					uploadedAt: new Date().toISOString(),
					chunksCount: 0,
					processed: false,
					filename: file.name,
				} satisfies Reference);

				// Trigger the document processing task
				await tasks.trigger<typeof processReferenceTask>("process-reference", {
					userId: metadata.userId,
					referenceId,
				});

				console.log("Upload complete - Processing triggered", { referenceId });

				// Return immediately to the client
				return {
					uploadedBy: metadata.userId,
					referenceId,
				};
			} catch (error: any) {
				console.error("Upload complete error:", error);
				throw new UploadThingError(`Processing failed: ${error?.message || 'Unknown error'}`);
			}
		}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
