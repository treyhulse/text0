"use server";

import {
  redis,
  DOCUMENT_KEY,
  USER_DOCUMENTS_KEY,
  type Document,
} from "@/lib/redis";
import { auth } from "@clerk/nextjs/server";
import { nanoid } from "@/lib/nanoid";
import type { ActionState } from "@/lib/utils";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export type CreateDocumentActionState = ActionState<
  { name: string },
  { documentId: string }
>;

export type UpdateDocumentNameActionState = ActionState<{
  name: string;
  documentId: string;
}>;

export async function createDocument(
  prevState: CreateDocumentActionState | undefined,
  formData: FormData
): Promise<CreateDocumentActionState> {
  const rawFormData = Object.fromEntries(formData.entries()) as {
    name: string;
  };

  try {
    const user = await auth();
    if (!user.userId) {
      throw new Error("Unauthorized");
    }

    const form = z.object({
      name: z.string().min(1, "Document name is required"),
    });

    const parsed = form.safeParse(rawFormData);

    if (!parsed.success) {
      return { success: false, error: parsed.error.message };
    }

    const id = nanoid();
    const document: Document = {
      id,
      userId: user.userId,
      name: parsed.data.name,
      content: "",
      createdAt: new Date().toISOString(),
    };

    // Store the document
    await redis.hset(DOCUMENT_KEY(id), document);

    // Add document ID to user's documents list
    await redis.zadd(USER_DOCUMENTS_KEY(user.userId), {
      score: Date.now(),
      member: id,
    });

    return { success: true, data: { documentId: id } };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      form: rawFormData,
    };
  }
}

export async function updateDocumentName(
  prevState: UpdateDocumentNameActionState | undefined,
  formData: FormData
): Promise<UpdateDocumentNameActionState> {
  const rawFormData = Object.fromEntries(formData.entries()) as {
    name: string;
    documentId: string;
  };

  try {
    const user = await auth();
    if (!user.userId) {
      throw new Error("Unauthorized");
    }

    const form = z.object({
      name: z.string().min(1, "Document name is required"),
      documentId: z.string().min(1, "Document ID is required"),
    });

    const parsed = form.safeParse(rawFormData);

    if (!parsed.success) {
      return { success: false, error: parsed.error.message };
    }

    // Verify the document belongs to the user
    const document = await redis.hgetall(DOCUMENT_KEY(parsed.data.documentId));
    if (!document || document.userId !== user.userId) {
      throw new Error("Document not found or unauthorized");
    }

    // Update the document name
    await redis.hset(DOCUMENT_KEY(parsed.data.documentId), {
      ...document,
      name: parsed.data.name,
    });

    revalidatePath(`/docs/${parsed.data.documentId}`);

    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      form: rawFormData,
    };
  }
}
