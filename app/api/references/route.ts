import { getSecureSession } from "@/lib/auth/server";
import {
	REFERENCE_KEY,
	type Reference,
	USER_REFERENCES_KEY,
	redis,
} from "@/lib/redis";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const session = await getSecureSession();
		if (!session.userId) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		// Get all reference IDs for the user
		const referenceIds = await redis.smembers(
			USER_REFERENCES_KEY(session.userId),
		);

		// Get all references in parallel
		const references = await Promise.all(
			referenceIds.map(async (id) => {
				const reference = await redis.hgetall(REFERENCE_KEY(id));
				return reference as Reference | null;
			}),
		);

		// Filter out any null references and sort by uploadedAt
		const validReferences = references
			.filter(
				(ref): ref is Reference => ref !== null && Object.keys(ref).length > 0,
			)
			.sort(
				(a, b) =>
					new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
			);

		console.log(validReferences);

		return NextResponse.json(validReferences);
	} catch (error) {
		console.error("Error fetching references:", error);
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
