import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { redis, NOTE_KEY } from "@/lib/redis";
import { z } from "zod";

const updateNoteSchema = z.object({
  content: z.string(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { note_id: string } }
) {
  try {
    const user = await auth();
    if (!user.userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const parsed = updateNoteSchema.safeParse(body);

    if (!parsed.success) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    // Verify the note belongs to the user
    const note = await redis.hgetall(NOTE_KEY(params.note_id));
    if (!note || note.userId !== user.userId) {
      return new NextResponse("Note not found or unauthorized", { status: 404 });
    }

    // Update the note content
    await redis.hset(NOTE_KEY(params.note_id), {
      ...note,
      content: parsed.data.content,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[NOTE_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 