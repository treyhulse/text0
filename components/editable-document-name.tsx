"use client";

import { updateDocumentName } from "@/actions/docs";
import { Input } from "@/components/ui/input";
import { useEffect, useRef } from "react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

interface EditableDocumentNameProps {
	documentId: string;
	initialName: string;
}

export function EditableDocumentName({
	documentId,
	initialName,
}: Readonly<EditableDocumentNameProps>) {
	const [state, formAction, isPending] = React.useActionState(
		updateDocumentName,
		undefined,
	);
	const inputRef = useRef<HTMLInputElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (state?.success) {
			toast.success("Document name updated");
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
		<form
			action={formAction}
			className="mb-4 px-8"
			aria-label="Edit document name"
		>
			<input type="hidden" name="documentId" value={documentId} />
			<Input
				ref={inputRef}
				name="name"
				defaultValue={initialName}
				onKeyDown={handleKeyDown}
				disabled={isPending}
				className="!text-2xl h-8 border-none bg-transparent p-0 font-semibold focus-visible:ring-0"
				aria-label="Document name"
				aria-disabled={isPending}
			/>
			<Button
				ref={buttonRef}
				type="submit"
				className="hidden"
				disabled={isPending}
				aria-label="Save document name"
			>
				Save
			</Button>
		</form>
	);
}
