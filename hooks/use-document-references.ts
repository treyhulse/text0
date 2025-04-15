import type { Reference } from "@/lib/redis";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const DOCUMENT_REFERENCES_KEY = (documentId: string) =>
	`document:${documentId}:references`;

async function fetchReferences() {
	const response = await fetch("/api/references");
	if (!response.ok) {
		throw new Error("Failed to fetch references");
	}
	return response.json() as Promise<Reference[]>;
}

export function useDocumentReferences(documentId: string) {
	const [selectedReferences, setSelectedReferences] = useState<string[]>([]);

	const { data: references, isLoading } = useQuery({
		queryKey: ["references"],
		queryFn: fetchReferences,
	});

	useEffect(() => {
		if (typeof window === "undefined") return;
		// Load selected references from localStorage
		const storedReferences = localStorage.getItem(
			DOCUMENT_REFERENCES_KEY(documentId),
		);
		if (storedReferences) {
			setSelectedReferences(JSON.parse(storedReferences));
		}
	}, [documentId]);

	const toggleReference = (referenceId: string) => {
		if (typeof window === "undefined") return;
		setSelectedReferences((prev) => {
			const newSelected = prev.includes(referenceId)
				? prev.filter((id) => id !== referenceId)
				: [...prev, referenceId];

			// Save to localStorage
			localStorage.setItem(
				DOCUMENT_REFERENCES_KEY(documentId),
				JSON.stringify(newSelected),
			);

			return newSelected;
		});
	};

	const isReferenceSelected = (referenceId: string) => {
		return selectedReferences.includes(referenceId);
	};

	const clearSelectedReferences = () => {
		setSelectedReferences([]);
		localStorage.removeItem(DOCUMENT_REFERENCES_KEY(documentId));
	};

	return {
		references,
		isLoading,
		selectedReferences,
		toggleReference,
		isReferenceSelected,
		clearSelectedReferences,
	};
}
