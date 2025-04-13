"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	CheckCircle2,
	AlertCircle,
	Calendar,
	Clock,
	MapPin,
	Users,
} from "lucide-react";
import Link from "next/link";
import { GoogleCalendarIcon } from "@/components/ui/icons/google-calendar";

interface CalendarList {
	id: string;
	summary: string;
	description?: string;
	primary?: boolean;
	backgroundColor?: string;
}

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

export default function GoogleCalendarIntegrationPage() {
	const { user, isLoaded: userLoaded } = useUser();
	const [calendars, setCalendars] = useState<CalendarList[]>([]);
	const [events, setEvents] = useState<Record<string, CalendarEvent[]>>({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<{
		message: string;
		details?: unknown;
	} | null>(null);

	const isConnected = user?.externalAccounts?.some(
		(account) =>
			account.provider === "google" &&
			account.approvedScopes.includes(
				"https://www.googleapis.com/auth/calendar.app.created",
			) &&
			account.approvedScopes.includes(
				"https://www.googleapis.com/auth/calendar.calendarlist.readonly",
			),
	);

	useEffect(() => {
		async function fetchCalendarData() {
			if (!userLoaded || !isConnected) {
				setLoading(false);
				return;
			}

			try {
				const response = await fetch("/api/google-calendar/data", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error, { cause: errorData });
				}

				const data = await response.json();
				setCalendars(data.calendars || []);
				setEvents(data.events || {});
			} catch (err: unknown) {
				if (err instanceof Error) {
					setError({
						message: err.message,
						details: err.cause,
					});
				} else {
					setError({ message: "An unknown error occurred" });
				}
			} finally {
				setLoading(false);
			}
		}

		fetchCalendarData();
	}, [userLoaded, isConnected]);

	if (!userLoaded || loading) {
		return (
			<div className="flex justify-center items-center h-full">
				<p>Loading...</p>
			</div>
		);
	}

	if (!isConnected) {
		return (
			<div className="p-8">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center space-x-2">
							<GoogleCalendarIcon />
							<span>Google Calendar Integration</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground mb-4">
							Connect your Google Calendar to view your calendars and events.
						</p>
						<Button asChild>
							<Link href="/sign-in?redirect=/integrations/google-calendar">
								Connect Google Calendar
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-8">
				<Card>
					<CardContent>
						<p className="text-red-500">Error: {error.message}</p>
						<pre className="text-sm text-gray-500 mt-2">
							Details: {JSON.stringify(error.details ?? {}, null, 2)}
						</pre>
						<Button variant="outline" className="mt-4" asChild>
							<Link href="/sign-in?redirect=/integrations/google-calendar">
								Reconnect Google Calendar
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	const secondaryCalendars = calendars.filter((calendar) => !calendar.primary);

	return (
		<div className="h-full flex-1 flex-col space-y-8 p-8">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<GoogleCalendarIcon />
					<div>
						<h2 className="text-2xl font-bold tracking-tight">
							Google Calendar Integration
						</h2>
						<p className="text-muted-foreground">
							View your calendars and events
						</p>
					</div>
					<Badge
						variant="default"
						className="bg-green-500/10 text-green-500 hover:bg-green-500/20"
					>
						<CheckCircle2 className="mr-1 h-3 w-3" />
						Connected
					</Badge>
				</div>
			</div>

			{/* Secondary Calendars */}
			<Card>
				<CardHeader>
					<CardTitle>Your Secondary Calendars</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-6">
						{secondaryCalendars.length === 0 && (
							<p className="text-muted-foreground">
								No secondary calendars found.
							</p>
						)}
						{secondaryCalendars.map((calendar) => (
							<div key={calendar.id} className="space-y-4">
								<div className="flex items-center space-x-4 border-b pb-4">
									<div
										className="h-4 w-4 rounded-full"
										style={{
											backgroundColor: calendar.backgroundColor || "#4285f4",
										}}
									/>
									<div>
										<p className="font-medium">{calendar.summary}</p>
										{calendar.description && (
											<p className="text-sm text-muted-foreground">
												{calendar.description}
											</p>
										)}
									</div>
								</div>

								{/* Calendar Events */}
								<div className="pl-8">
									{!events[calendar.id] || events[calendar.id].length === 0 ? (
										<p className="text-sm text-muted-foreground">
											No events found in this calendar.
										</p>
									) : (
										<div className="space-y-3">
											{events[calendar.id].map((event) => (
												<div key={event.id} className="flex flex-col space-y-2">
													<div className="flex items-start space-x-4">
														<Calendar className="h-5 w-5 mt-1 text-muted-foreground" />
														<div>
															<p className="font-medium">{event.summary}</p>
															{event.description && (
																<p className="text-sm text-muted-foreground">
																	{event.description}
																</p>
															)}
															<div className="flex items-center space-x-2 mt-1">
																<Clock className="h-3 w-3 text-muted-foreground" />
																<span className="text-xs text-muted-foreground">
																	{event.start.dateTime
																		? new Date(
																				event.start.dateTime,
																			).toLocaleString()
																		: event.start.date}
																</span>
															</div>
															{event.location && (
																<div className="flex items-center space-x-2 mt-1">
																	<MapPin className="h-3 w-3 text-muted-foreground" />
																	<span className="text-xs text-muted-foreground">
																		{event.location}
																	</span>
																</div>
															)}
															{event.attendees &&
																event.attendees.length > 0 && (
																	<div className="flex items-center space-x-2 mt-1">
																		<Users className="h-3 w-3 text-muted-foreground" />
																		<span className="text-xs text-muted-foreground">
																			{event.attendees.length} attendees
																		</span>
																	</div>
																)}
														</div>
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
