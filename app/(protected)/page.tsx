"use client";

import React from "react";
import { FileText, Search, ArrowRight } from "lucide-react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { useUser } from "@clerk/nextjs";
import { NewNoteButton } from "@/components/new-notebutton";

const notes = [
  {
    id: 1,
    title: "How to conduct a user interview that could improve your product?",
    content:
      "You cannot understand good design if you do not understand people; design is made for people. User interviews are a tool that can help you get this understanding...",
    lastModified: "2024-03-20T10:00:00Z",
    tags: ["Needs to be done", "Questions"],
    readTime: "3 min",
  },
  {
    id: 2,
    title: "Design challenges",
    content:
      "What Is A Design Challenge? Design challenges are exercises or competitions that designers can do to boost creativity, create positive habits, and learn new methods for...",
    lastModified: "2024-03-19T15:30:00Z",
    tags: ["Workshops", "Design challenges", "Work in progress"],
    readTime: "5 min",
  },
];

export default function HomePage() {
  const user = useUser();
  return (
    <div className="relative min-h-screen bg-background">
      {/* Hero Section with Gradient */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background pb-12 pt-16">
        <div className="container px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="mb-3 text-2xl font-semibold tracking-tight">
              Welcome back, {user.user?.fullName}!
            </h1>
            <p className="text-base text-muted-foreground">
              Continue where you left off or create something new
            </p>
            <div className="mx-auto mt-6 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search notes..."
                  className="h-9 w-full rounded-md pl-9 pr-4 text-sm"
                />
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <kbd className="text-muted-foreground/70 inline-flex h-5 items-center rounded border px-1 font-mono text-[10px] font-medium">
                    ⌘K
                  </kbd>
                </div>
              </div>
            </div>
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
          {/* Notes Section */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-medium tracking-wide">My notes</h2>
              </div>
              <NewNoteButton />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {notes.map((note) => (
                <Link
                  key={note.id}
                  href={`/writing?note=${note.id}`}
                  className="group flex flex-col rounded-lg border bg-card p-4 shadow-sm transition-all hover:border-primary/20 hover:shadow-md"
                >
                  <h3 className="mb-2 text-base font-medium transition-colors group-hover:text-primary">
                    {note.title}
                  </h3>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {note.content}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {note.tags.map((tag) => (
                      <span
                        key={`${tag}`}
                        className="inline-flex items-center rounded-md border border-border/40 bg-background/40 px-2 py-0.5 text-xs font-medium text-foreground/80"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3 text-sm text-muted-foreground">
                    <span>{note.readTime}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
