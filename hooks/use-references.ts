import type { Reference } from "@/lib/redis";
import { useQuery } from "@tanstack/react-query";

async function fetchReferences() {
	const response = await fetch("/api/references");
	if (!response.ok) {
		throw new Error("Failed to fetch references");
	}
	return response.json() as Promise<Reference[]>;
}

export function useReferences() {
	return useQuery({
		queryKey: ["references"],
		queryFn: fetchReferences,
		staleTime: 3000, // Consider data stale after 3 seconds
		refetchInterval: 10000, // Refetch every 10 seconds
	});
}
