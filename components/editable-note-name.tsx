"use client";

import { useEffect, useRef } from "react";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { updateNoteName, UpdateNoteNameActionState } from "@/app/actions/notes";
import { toast } from "sonner";
import { Button } from "./ui/button";

interface EditableNoteNameProps {
  noteId: string;
  initialName: string;
}

export function EditableNoteName({
  noteId,
  initialName,
}: EditableNoteNameProps) {
  const [state, formAction, isPending] = React.useActionState(
    updateNoteName,
    undefined
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (state?.success) {
      toast.success("Note name updated");
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  }, [state]);

  useEffect(() => {
    if (!state?.success && state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      buttonRef.current?.click();
    }
  };

  return (
    <form action={formAction}>
      <input type="hidden" name="noteId" value={noteId} />
      <Input
        ref={inputRef}
        name="name"
        defaultValue={initialName}
        onKeyDown={handleKeyDown}
        disabled={isPending}
        className="h-8 border-none bg-transparent p-0 text-lg font-semibold focus-visible:ring-0"
      />
      <Button
        ref={buttonRef}
        type="submit"
        className="hidden"
        disabled={isPending}
      >
        Save
      </Button>
    </form>
  );
}
