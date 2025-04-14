"use client";

import { useEffect } from "react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { createNote } from "@/app/actions/notes";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function NewNoteButton() {
  const [state, formAction, isPending] = React.useActionState(
    createNote,
    undefined
  );

  const router = useRouter();

  useEffect(() => {
    if (state?.success && state.data?.noteId) {
      toast.success("Note created successfully");
      router.push(`/notes/${state.data.noteId}`);
    }
  }, [state, router]);

  useEffect(() => {
    if (!state?.success && state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-sm"
        >
          <Plus className="h-4 w-4" />
          New Note
        </Button>
      </DialogTrigger>
      <DialogContent title="Create New Note">
        <DialogHeader>
          <DialogTitle>Create New Note</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <Input name="name" placeholder="Note name" required />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating..." : "Create Note"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
