import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClerkClient, type OauthAccessToken } from "@clerk/backend";
import { ClerkAPIResponseError } from "@clerk/shared";

export async function GET() {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json(
				{ error: "Unauthorized: No user ID found" },
				{ status: 401 },
			);
		}

		const clerkClient = createClerkClient({
			secretKey: process.env.CLERK_SECRET_KEY,
		});

		let oauthTokens: OauthAccessToken[] | undefined;
		try {
			const response = await clerkClient.users.getUserOauthAccessToken(
				userId,
				"discord",
			);
			oauthTokens = response.data;
		} catch (error) {
			if (error instanceof ClerkAPIResponseError) {
				return NextResponse.json(
					{
						error: "Failed to retrieve Discord OAuth token",
						details: error.errors,
					},
					{ status: 400 },
				);
			}
			throw error;
		}

		if (!oauthTokens || oauthTokens.length === 0) {
			return NextResponse.json(
				{ error: "Discord OAuth token not found for this user" },
				{ status: 400 },
			);
		}

		const token = oauthTokens[0].token;

		// Fetch user data from Discord
		const userResponse = await fetch("https://discord.com/api/users/@me", {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		if (!userResponse.ok) {
			const errorData = await userResponse.json();
			return NextResponse.json(
				{
					error: "Failed to fetch user data from Discord",
					details: errorData,
					status: userResponse.status,
				},
				{ status: userResponse.status },
			);
		}
		const userData = await userResponse.json();

		// Fetch user's guilds (servers)
		const guildsResponse = await fetch(
			"https://discord.com/api/users/@me/guilds",
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		);
		if (!guildsResponse.ok) {
			const errorData = await guildsResponse.json();
			return NextResponse.json(
				{
					error: "Failed to fetch guilds from Discord",
					details: errorData,
					status: guildsResponse.status,
				},
				{ status: guildsResponse.status },
			);
		}
		const guildsData = await guildsResponse.json();

		return NextResponse.json({
			user: userData,
			guilds: guildsData,
		});
	} catch (error) {
		console.error("Error in Discord API route:", error);
		if (error instanceof ClerkAPIResponseError) {
			return NextResponse.json(
				{
					error: "Clerk API error",
					details: error.errors,
				},
				{ status: 500 },
			);
		}
		return NextResponse.json(
			{ error: "Internal server error", details: String(error) },
			{ status: 500 },
		);
	}
}
