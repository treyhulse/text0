"use server";

import { redis, NOTE_KEY, USER_NOTES_KEY, type Note } from "@/lib/redis";
import { auth } from "@clerk/nextjs/server";
import { nanoid } from "@/lib/nanoid";
import type { ActionState } from "@/lib/utils";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export type CreateNoteActionState = ActionState<
  { name: string },
  { noteId: string }
>;

export type UpdateNoteNameActionState = ActionState<{
  name: string;
  noteId: string;
}>;

export async function createNote(
  prevState: CreateNoteActionState | undefined,
  formData: FormData
): Promise<CreateNoteActionState> {
  const rawFormData = Object.fromEntries(formData.entries()) as {
    name: string;
  };

  try {
    const user = await auth();
    if (!user.userId) {
      throw new Error("Unauthorized");
    }

    const form = z.object({
      name: z.string().min(1, "Note name is required"),
    });

    const parsed = form.safeParse(rawFormData);

    if (!parsed.success) {
      return { success: false, error: parsed.error.message };
    }

    const id = nanoid();
    const note: Note = {
      id,
      userId: user.userId,
      name: parsed.data.name,
      content: "",
      createdAt: new Date().toISOString(),
    };

    // Store the note
    await redis.hset(NOTE_KEY(id), note);

    // Add note ID to user's notes list
    await redis.zadd(USER_NOTES_KEY(user.userId), {
      score: Date.now(),
      member: id,
    });

    return { success: true, data: { noteId: id } };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      form: rawFormData,
    };
  }
}

export async function updateNoteName(
  prevState: UpdateNoteNameActionState | undefined,
  formData: FormData
): Promise<UpdateNoteNameActionState> {
  const rawFormData = Object.fromEntries(formData.entries()) as {
    name: string;
    noteId: string;
  };

  try {
    const user = await auth();
    if (!user.userId) {
      throw new Error("Unauthorized");
    }

    const form = z.object({
      name: z.string().min(1, "Note name is required"),
      noteId: z.string().min(1, "Note ID is required"),
    });

    const parsed = form.safeParse(rawFormData);

    if (!parsed.success) {
      return { success: false, error: parsed.error.message };
    }

    // Verify the note belongs to the user
    const note = await redis.hgetall(NOTE_KEY(parsed.data.noteId));
    if (!note || note.userId !== user.userId) {
      throw new Error("Note not found or unauthorized");
    }

    // Update the note name
    await redis.hset(NOTE_KEY(parsed.data.noteId), {
      ...note,
      name: parsed.data.name,
    });

    revalidatePath(`/notes/${parsed.data.noteId}`);

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
