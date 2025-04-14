import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { redis, DOCUMENT_KEY } from "@/lib/redis";
import { z } from "zod";

const updateDocumentSchema = z.object({
  content: z.string(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ doc_id: string }> }
) {
  try {
    const user = await auth();
    const { doc_id } = await params;
    if (!user.userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const parsed = updateDocumentSchema.safeParse(body);

    if (!parsed.success) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    // Verify the document belongs to the user
    const document = await redis.hgetall(DOCUMENT_KEY(doc_id));
    if (!document || document.userId !== user.userId) {
      return new NextResponse("Document not found or unauthorized", {
        status: 404,
      });
    }

    // Update the document content
    await redis.hset(DOCUMENT_KEY(doc_id), {
      ...document,
      content: parsed.data.content,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DOCUMENT_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
