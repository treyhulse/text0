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
			maxFileSize: "16KB",
			maxFileCount: 1,
		},
		text: {
			maxFileSize: "16KB",
			maxFileCount: 1,
		},
		"text/markdown": {
			maxFileSize: "16KB",
			maxFileCount: 1,
		},
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
			maxFileSize: "16KB",
			maxFileCount: 1,
		},
		"text/plain": {
			maxFileSize: "16KB",
			maxFileCount: 1,
		},
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
			maxFileSize: "16KB",
			maxFileCount: 1,
		},
		"application/vnd.openxmlformats-officedocument.presentationml.presentation":
			{
				maxFileSize: "16KB",
				maxFileCount: 1,
			},
	})
		.middleware(async () => {
			// This code runs on your server before upload
			const session = await getSecureSession();

			// If you throw, the user will not be able to upload
			if (!session.userId) throw new UploadThingError("Unauthorized");

			// Whatever is returned here is accessible in onUploadComplete as `metadata`
			return { userId: session.userId };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			console.log("Upload complete", { metadata, file });
			const referenceId = nanoid();

			await redis.sadd(USER_REFERENCES_KEY(metadata.userId), referenceId);
			await redis.hset(REFERENCE_KEY(referenceId), {
				id: referenceId,
				userId: metadata.userId,
				url: file.ufsUrl,
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

			// Return immediately to the client
			return {
				uploadedBy: metadata.userId,
				referenceId,
			};
		}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
