import { Redis } from "@upstash/redis";
import { EditableNoteName } from "@/components/editable-note-name";
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

interface Note {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

export default async function NotePage({
  params,
}: {
  params: { note_id: string };
}) {
  const note = (await redis.hgetall(`note:${params.note_id}`)) as Note | null;

  if (!note) {
    return <div>Note not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <EditableNoteName noteId={note.id} initialName={note.name} />
      <h1 className="text-2xl font-bold">{note.name}</h1>
    </div>
  );
}
