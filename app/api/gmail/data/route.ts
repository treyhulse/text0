import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClerkClient, type OauthAccessToken } from "@clerk/backend";
import { ClerkAPIResponseError } from "@clerk/shared";
import { google } from "googleapis";

interface GmailMessage {
	id: string;
	from: string;
	subject: string;
	date: string;
	snippet: string;
}

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
				"google",
			);
			oauthTokens = response.data;
		} catch (error) {
			if (error instanceof ClerkAPIResponseError) {
				return NextResponse.json(
					{
						error: "Failed to retrieve Google OAuth token",
						details: error.errors,
					},
					{ status: 400 },
				);
			}
			throw error;
		}

		if (!oauthTokens || oauthTokens.length === 0) {
			return NextResponse.json(
				{ error: "Google OAuth token not found for this user" },
				{ status: 400 },
			);
		}

		const token = oauthTokens[0].token;

		// Initialize Gmail API client
		const oauth2Client = new google.auth.OAuth2();
		oauth2Client.setCredentials({ access_token: token });
		const gmail = google.gmail({ version: "v1", auth: oauth2Client });

		// Get user email from OAuth token info
		const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
		const userInfo = await oauth2.userinfo.get();

		// Create a simplified profile since we can't access full Gmail profile
		const profile = {
			emailAddress: userInfo.data.email || "Unknown",
			messagesTotal: 0, // We don't have access to this info
			threadsTotal: 0, // We don't have access to this info
			historyId: "0", // We don't have access to this info
		};

		// Since we can't list messages with current scope, return empty list
		const messages: GmailMessage[] = [];

		return NextResponse.json({
			profile,
			messages,
		});
	} catch (error) {
		console.error("Error in Gmail API route:", error);
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
