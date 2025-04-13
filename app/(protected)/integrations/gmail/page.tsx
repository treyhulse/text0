"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GmailIcon } from "@/components/ui/icons/gmail";
import { CheckCircle2, AlertCircle, Mail, Clock } from "lucide-react";
import Link from "next/link";

interface GmailProfile {
	emailAddress: string;
	messagesTotal: number;
	threadsTotal: number;
	historyId: string;
}

interface GmailMessage {
	id: string;
	from?: string;
	subject?: string;
	date?: string;
	snippet?: string;
}

export default function GmailIntegrationPage() {
	const { user, isLoaded: userLoaded } = useUser();
	const [profile, setProfile] = useState<GmailProfile | null>(null);
	const [messages, setMessages] = useState<GmailMessage[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<{
		message: string;
		details?: unknown;
	} | null>(null);

	const isConnected = user?.externalAccounts?.some(
		(account) =>
			account.provider === "google" &&
			account.approvedScopes.includes(
				"https://www.googleapis.com/auth/gmail.addons.current.message.action",
			),
	);

	useEffect(() => {
		async function fetchGmailData() {
			if (!userLoaded || !isConnected) {
				setLoading(false);
				return;
			}

			try {
				const response = await fetch("/api/gmail/data", {
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
				setProfile(data.profile);
				setMessages(data.messages);
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

		fetchGmailData();
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
							<GmailIcon className="h-6 w-6" />
							<span>Gmail Integration</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground mb-4">
							Connect your Gmail account to view your emails and profile.
						</p>
						<Button asChild>
							<Link href="/sign-in?redirect=/integrations/gmail">
								Connect Gmail
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
							<Link href="/sign-in?redirect=/integrations/gmail">
								Reconnect Gmail
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="h-full flex-1 flex-col space-y-8 p-8">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<GmailIcon className="h-8 w-8" />
					<div>
						<h2 className="text-2xl font-bold tracking-tight">
							Gmail Integration
						</h2>
						<p className="text-muted-foreground">
							View your Gmail profile and recent messages
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
				<Button variant="outline" disabled>
					Disconnect
				</Button>
			</div>

			{/* Profile Information */}
			{profile && (
				<Card>
					<CardHeader>
						<CardTitle>Profile Information</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<p className="text-sm">
								<span className="font-medium">Email Address:</span>{" "}
								{profile.emailAddress}
							</p>
							<p className="text-sm">
								<span className="font-medium">Total Messages:</span>{" "}
								{profile.messagesTotal}
							</p>
							<p className="text-sm">
								<span className="font-medium">Total Threads:</span>{" "}
								{profile.threadsTotal}
							</p>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Recent Messages */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Messages</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{messages.length === 0 && (
							<p className="text-muted-foreground">No recent messages found.</p>
						)}
						{messages.map((message) => (
							<div
								key={message.id}
								className="flex items-start justify-between border-b py-4"
							>
								<div className="flex items-start space-x-4">
									<Mail className="h-5 w-5 mt-1 text-muted-foreground" />
									<div>
										<p className="font-medium">
											{message.subject || "No Subject"}
										</p>
										<p className="text-sm text-muted-foreground">
											From: {message.from}
										</p>
										<div className="flex items-center space-x-2 mt-1">
											<Clock className="h-3 w-3 text-muted-foreground" />
											<span className="text-xs text-muted-foreground">
												{message.date
													? new Date(message.date).toLocaleString()
													: "Unknown date"}
											</span>
										</div>
										{message.snippet && (
											<p className="text-sm text-muted-foreground mt-2">
												{message.snippet}
											</p>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
