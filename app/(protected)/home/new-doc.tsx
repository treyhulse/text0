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
			router.push(
				`/docs/${state.data?.documentId}?from=${encodeURIComponent(pathname)}`,
			);
		}
	}, [state, router, pathname]);

	return (
		<form action={formAction}>
			<input type="hidden" name="name" defaultValue="New Document" />
			<input type="hidden" name="pathname" defaultValue={pathname} />
			<QuickActionButton
				iconName="FileText"
				label="New Document"
				loading={isPending}
			>
				<span className="hidden md:block">New Document</span>
				<span className="block md:hidden">New Doc</span>
			</QuickActionButton>
		</form>
	);
};
