"use client";

import { createDocument } from "@/actions/docs";
import { QuickActionButton } from "@/components/home/quick-action-button";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

export const NewDoc = () => {
	const [state, formAction, isPending] = React.useActionState(
		createDocument,
		undefined,
	);
	const router = useRouter();
	const pathname = usePathname();

	React.useEffect(() => {
		if (state?.success) {
			router.push(`/docs/${state.data?.documentId}`);
		}
	}, [state, router]);

	return (
		<form action={formAction}>
			<input type="hidden" name="name" defaultValue="New Document" />
			<input type="hidden" name="pathname" defaultValue={pathname} />
			<QuickActionButton
				iconName="FileText"
				label="New Document"
				loading={isPending}
			/>
		</form>
	);
};
