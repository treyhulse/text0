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
import { createDocument } from "@/actions/docs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface NewDocumentButtonProps {
	className?: string;
}

export function NewDocumentButton({ className }: NewDocumentButtonProps) {
	const [state, formAction, isPending] = React.useActionState(
		createDocument,
		undefined,
	);

	const router = useRouter();

	useEffect(() => {
		if (state?.success && state.data?.documentId) {
			toast.success("Document created successfully");
			router.push(`/docs/${state.data.documentId}`);
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
					className={cn(
						"flex border border-dashed border-foreground/20 items-center gap-2 text-sm",
						className,
					)}
					data-new-doc-trigger
				>
					<Plus className="h-4 w-4" />
					New Document
				</Button>
			</DialogTrigger>
			<DialogContent title="Create New Document">
				<DialogHeader>
					<DialogTitle>Create New Document</DialogTitle>
				</DialogHeader>
				<form action={formAction} className="space-y-4">
					<Input name="name" placeholder="Document name" required />
					<Button type="submit" className="w-full" disabled={isPending}>
						{isPending ? "Creating..." : "Create Document"}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
