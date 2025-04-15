import { getSecureSession } from "@/lib/auth/server";
import { type OauthAccessToken, createClerkClient } from "@clerk/backend";
import { ClerkAPIResponseError } from "@clerk/shared";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const session = await getSecureSession();
		if (!session.userId) {
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
			const oauthTokensResponse =
				await clerkClient.users.getUserOauthAccessToken(
					session.userId,
					"github",
				);
			oauthTokens = oauthTokensResponse.data;
		} catch (error) {
			if (error instanceof ClerkAPIResponseError) {
				return NextResponse.json(
					{
						error: "Failed to retrieve GitHub OAuth token",
						details: error.errors,
					},
					{ status: 400 },
				);
			}
			throw error;
		}

		if (!oauthTokens || oauthTokens.length === 0) {
			return NextResponse.json(
				{ error: "GitHub OAuth token not found for this user" },
				{ status: 400 },
			);
		}

		const token = oauthTokens[0].token;

		const userResponse = await fetch("https://api.github.com/user", {
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: "application/vnd.github+json",
			},
		});
		if (!userResponse.ok) {
			const errorData = await userResponse.json();
			return NextResponse.json(
				{
					error: "Failed to fetch user data from GitHub",
					details: errorData,
					status: userResponse.status,
				},
				{ status: userResponse.status },
			);
		}
		const userData = await userResponse.json();

		const reposResponse = await fetch(
			"https://api.github.com/user/repos?sort=updated&per_page=10",
			{
				headers: {
					Authorization: `Bearer ${token}`,
					Accept: "application/vnd.github+json",
				},
			},
		);
		if (!reposResponse.ok) {
			const errorData = await reposResponse.json();
			return NextResponse.json(
				{
					error: "Failed to fetch repositories from GitHub",
					details: errorData,
					status: reposResponse.status,
				},
				{ status: reposResponse.status },
			);
		}
		const reposData = await reposResponse.json();

		const notificationsResponse = await fetch(
			"https://api.github.com/notifications?per_page=10",
			{
				headers: {
					Authorization: `Bearer ${token}`,
					Accept: "application/vnd.github+json",
				},
			},
		);
		if (!notificationsResponse.ok) {
			const errorData = await notificationsResponse.json();
			return NextResponse.json(
				{
					error: "Failed to fetch notifications from GitHub",
					details: errorData,
					status: notificationsResponse.status,
				},
				{ status: notificationsResponse.status },
			);
		}
		const notificationsData = await notificationsResponse.json();

		return NextResponse.json({
			user: userData,
			repos: reposData,
			notifications: notificationsData,
		});
	} catch (error) {
		console.error("Error in GitHub API route:", error);
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
