import { FileText, Search, ArrowRight } from "lucide-react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { NewNoteButton } from "@/components/new-notebutton";
import {
  NOTE_KEY,
  type Note,
  USER_DOCUMENTS_KEY,
  USER_NOTES_KEY,
  redis,
} from "@/lib/redis";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FileUploadUploadThing } from "@/components/file-upload-uploadthing";
export default async function HomePage() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  const notesWithIds = await redis.zrange<string[]>(
    USER_NOTES_KEY(user.id),
    0,
    -1
  );
  const _notes = await Promise.all(
    notesWithIds.map((noteId) => redis.hgetall<Note>(NOTE_KEY(noteId)))
  );
  const notes = _notes.map((note) => note as Note);

  const documentsCount = await redis.scard(USER_DOCUMENTS_KEY(user.id));

  return (
    <div className="relative min-h-screen bg-background">
      {/* Hero Section with Gradient */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background pb-12 pt-16">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="mb-3 text-2xl font-semibold tracking-tight">
              Welcome{documentsCount > 0 && " back"}, {user?.fullName}!
            </h1>
            <p className="text-base text-muted-foreground">
              {documentsCount > 0
                ? "Continue where you left off or create something new"
                : "Add some references to text0 and experience an absurdly smart writing"}
            </p>
          </div>
        </div>
        {/* Decorative gradients */}
        <div
          className="pointer-events-none absolute left-[15%] top-1/4 h-[400px] w-[400px] animate-float-slow"
          style={{
            background:
              "radial-gradient(circle at center, hsl(var(--primary)) 0%, transparent 70%)",
            opacity: 0.15,
            filter: "blur(60px)",
          }}
        />
        <div
          className="pointer-events-none absolute bottom-1/3 right-[15%] h-[350px] w-[350px] animate-float"
          style={{
            background:
              "radial-gradient(circle at center, hsl(var(--primary)) 0%, transparent 70%)",
            opacity: 0.12,
            filter: "blur(50px)",
          }}
        />
      </section>

      <div className="container px-4 pb-8">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* Documents Section */}
          {documentsCount === 0 && (
            <div>
              <div className="mb-4 flex w-full flex-col items-center justify-center">
                <FileUploadUploadThing />
              </div>
            </div>
          )}
          {/* Notes Section */}
          {notes.length > 0 ? (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm font-medium tracking-wide">
                    My notes
                  </h2>
                </div>
                <NewNoteButton />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {notes.map((note) => (
                  <Link
                    key={note.id}
                    href={`/notes/${note.id}`}
                    className="group flex flex-col rounded-lg border bg-card p-4 shadow-sm transition-all hover:border-primary/20 hover:shadow-md"
                  >
                    <h3 className="mb-2 text-base font-medium transition-colors group-hover:text-primary">
                      {note.name}
                    </h3>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {note.content}
                    </p>
                    <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3 text-sm text-muted-foreground">
                      <span>{note.createdAt}</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <p className="text-muted-foreground text-xs">
                Create your first note!
              </p>
              <NewNoteButton />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
