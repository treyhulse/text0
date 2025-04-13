import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClerkClient, type OauthAccessToken } from "@clerk/backend";
import { ClerkAPIResponseError } from "@clerk/shared";
import { google } from "googleapis";

interface CalendarEvent {
	id: string;
	summary: string;
	description?: string;
	start: { dateTime?: string; date?: string };
	end: { dateTime?: string; date?: string };
	location?: string;
	htmlLink: string;
	attendees?: { email: string; responseStatus: string }[];
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

		// Initialize Calendar API client
		const oauth2Client = new google.auth.OAuth2();
		oauth2Client.setCredentials({ access_token: token });
		const calendar = google.calendar({ version: "v3", auth: oauth2Client });

		// Get calendar list
		const calendarList = await calendar.calendarList.list();
		const secondaryCalendars =
			calendarList.data.items?.filter((cal) => !cal.primary) || [];

		// Get events for each secondary calendar
		const eventsPromises = secondaryCalendars.map(async (cal) => {
			const now = new Date();
			if (!cal.id) {
				return {
					calendarId: cal.id,
					events: [],
				};
			}
			try {
				const events = await calendar.events.list({
					calendarId: cal.id,
					timeMin: now.toISOString(),
					maxResults: 10,
					singleEvents: true,
					orderBy: "startTime",
				});

				return {
					calendarId: cal.id,
					events: events.data.items || [],
				};
			} catch (error) {
				// If we get a 404, it means we don't have access to this calendar
				// This is expected for calendars not created by our app
				console.log(`No access to calendar ${cal.id}: ${error}`);
				return {
					calendarId: cal.id,
					events: [],
				};
			}
		});

		const eventsResults = await Promise.all(eventsPromises);

		const eventsMap = eventsResults.reduce(
			(acc, { calendarId, events }) => {
				if (!calendarId) {
					return acc;
				}
				acc[calendarId] = events.map((event) => ({
					id: event.id || "",
					summary: event.summary || "",
					description: event.description || "",
					start: {
						dateTime: event.start?.dateTime || undefined,
						date: event.start?.date || undefined,
					},
					end: {
						dateTime: event.end?.dateTime || undefined,
						date: event.end?.date || undefined,
					},
					location: event.location || "",
					htmlLink: event.htmlLink || "",
					attendees:
						event.attendees?.map((a) => ({
							email: a.email || "",
							responseStatus: a.responseStatus || "",
						})) || [],
				}));
				return acc;
			},
			{} as Record<string, CalendarEvent[]>,
		);

		return NextResponse.json({
			calendars: calendarList.data.items,
			events: eventsMap,
		});
	} catch (error) {
		console.error("Error in Google Calendar API route:", error);
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
