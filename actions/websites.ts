"use server";

import { getSecureSession } from "@/lib/auth/server";
import { redis } from "@/lib/redis";
import type { Reference } from "@/lib/redis";
import type { ActionState } from "@/lib/utils";
import type { processReferenceTask } from "@/trigger/process-document";
import { tasks } from "@trigger.dev/sdk/v3";
import { nanoid } from "@/lib/nanoid";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const USER_REFERENCES_KEY = (userId: string) => `user:${userId}:references`;
const REFERENCE_KEY = (referenceId: string) => `reference:${referenceId}`;

export type AddWebsiteReferenceActionState = ActionState<
	{ url: string },
	{ referenceId: string }
>;

export async function addWebsiteReference(
	prevState: AddWebsiteReferenceActionState | undefined,
	formData: FormData,
): Promise<AddWebsiteReferenceActionState> {
	const session = await getSecureSession();
	if (!session.userId) {
		throw new Error("Unauthorized");
	}

	const url = formData.get("url") as string;
	if (!url) {
		throw new Error("URL is required");
	}

	const urlSchema = z.string().url();
	const result = urlSchema.safeParse(url);
	if (!result.success) {
		throw new Error("Invalid URL");
	}

	const referenceId = nanoid();

	await redis.sadd(USER_REFERENCES_KEY(session.userId), referenceId);
	await redis.hset(REFERENCE_KEY(referenceId), {
		id: referenceId,
		userId: session.userId,
		url,
		uploadedAt: new Date().toISOString(),
		chunksCount: 0,
		processed: false,
		name: url,
	} satisfies Reference);

	// Trigger the document processing task
	await tasks.trigger<typeof processReferenceTask>("process-reference", {
		userId: session.userId,
		referenceId,
	});

	revalidatePath("/references");

	return { success: true };
}
