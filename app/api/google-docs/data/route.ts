import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClerkClient, type OauthAccessToken } from "@clerk/backend";
import { ClerkAPIResponseError } from "@clerk/shared";
import { google } from "googleapis";

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

		// Initialize Drive API client
		const oauth2Client = new google.auth.OAuth2();
		oauth2Client.setCredentials({ access_token: token });
		const drive = google.drive({ version: "v3", auth: oauth2Client });

		// Get files from the application's data folder
		const response = await drive.files.list({
			spaces: "appDataFolder",
			pageSize: 50,
			fields: "files(id, name, mimeType, createdTime, modifiedTime)",
			orderBy: "modifiedTime desc",
		});

		// Filter for Google Docs files
		const files = response.data.files || [];
		const docsFiles = files.filter(
			(file) => file.mimeType === "application/vnd.google-apps.document",
		);

		return NextResponse.json({
			files: docsFiles.map((file) => ({
				id: file.id,
				name: file.name,
				createdTime: file.createdTime,
				modifiedTime: file.modifiedTime,
				type: "document",
			})),
		});
	} catch (error) {
		console.error("Error in Google Drive API route:", error);
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
