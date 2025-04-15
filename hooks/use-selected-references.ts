"use client";

import * as React from "react";

const DOCUMENT_REFERENCES_KEY = (documentId: string) =>
	`document:${documentId}:references`;

export function useSelectedReferences(documentId: string) {
	const [selectedReferences, setSelectedReferences] = React.useState<string[]>(
		[],
	);

	React.useEffect(() => {
		// Only run on client side
		if (typeof window === "undefined") return;

		// Load selected references from localStorage
		const storedReferences = localStorage.getItem(
			DOCUMENT_REFERENCES_KEY(documentId),
		);
		if (storedReferences) {
			try {
				setSelectedReferences(JSON.parse(storedReferences));
			} catch (error) {
				console.error("Failed to parse stored references:", error);
				localStorage.removeItem(DOCUMENT_REFERENCES_KEY(documentId));
			}
		}
	}, [documentId]);

	const getSelectedReferences = React.useCallback(() => {
		if (typeof window === "undefined") return [];
		const storedReferences = localStorage.getItem(
			DOCUMENT_REFERENCES_KEY(documentId),
		);
		if (storedReferences) {
			return JSON.parse(storedReferences);
		}
		return [];
	}, [documentId]);

	const toggleReference = React.useCallback(
		(referenceId: string) => {
			if (typeof window === "undefined") return;

			setSelectedReferences((prev) => {
				const newSelected = prev.includes(referenceId)
					? prev.filter((id) => id !== referenceId)
					: [...prev, referenceId];

				// Save to localStorage
				try {
					localStorage.setItem(
						DOCUMENT_REFERENCES_KEY(documentId),
						JSON.stringify(newSelected),
					);
				} catch (error) {
					console.error("Failed to save references:", error);
				}

				return newSelected;
			});
		},
		[documentId],
	);

	const isReferenceSelected = React.useCallback(
		(referenceId: string) => {
			return selectedReferences.includes(referenceId);
		},
		[selectedReferences],
	);

	const clearSelectedReferences = React.useCallback(() => {
		if (typeof window === "undefined") return;

		setSelectedReferences([]);
		try {
			localStorage.removeItem(DOCUMENT_REFERENCES_KEY(documentId));
		} catch (error) {
			console.error("Failed to clear references:", error);
		}
	}, [documentId]);

	return {
		selectedReferences,
		toggleReference,
		isReferenceSelected,
		clearSelectedReferences,
		getSelectedReferences,
	};
}
