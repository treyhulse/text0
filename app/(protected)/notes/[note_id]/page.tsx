import { Redis } from "@upstash/redis";
import { EditableNoteName } from "@/components/editable-note-name";
import { auth } from "@clerk/nextjs/server";
import { type Note, NOTE_KEY } from "@/lib/redis";
import { TextEditor } from "./text-editor";
if (
  !process.env.UPSTASH_REDIS_REST_URL ||
  !process.env.UPSTASH_REDIS_REST_TOKEN
) {
  throw new Error("Missing Redis environment variables");
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function NotePage({
  params,
}: Readonly<{
  params: { note_id: string };
}>) {
  const user = await auth();
  const note: Note | null = await redis.hgetall(NOTE_KEY(params.note_id));

  if (!note) {
    return <div>Note not found</div>;
  }

  if (user.userId !== note.userId) {
    return <div>Note not found</div>;
  }

  return (
    <TextEditor
      initialContent={note.content}
      noteId={note.id}
      initialName={note.name}
    />
  );
}
