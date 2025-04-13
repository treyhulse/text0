"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DiscordIcon } from "@/components/ui/icons/discord";
import { CheckCircle2, AlertCircle, Server, Hash } from "lucide-react";
import Link from "next/link";

interface DiscordUser {
	id: string;
	username: string;
	discriminator: string;
	avatar?: string;
	email?: string;
}

interface DiscordGuild {
	id: string;
	name: string;
	icon?: string;
	owner: boolean;
	permissions: string;
}

interface DiscordChannel {
	id: string;
	name: string;
	type: number; // 0 for text, 2 for voice, etc.
}

export default function DiscordIntegrationPage() {
	const { user, isLoaded: userLoaded } = useUser();
	const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null);
	const [guilds, setGuilds] = useState<DiscordGuild[]>([]);
	const [channels, setChannels] = useState<DiscordChannel[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<{
		message: string;
		details?: unknown;
	} | null>(null);

	const isConnected = user?.externalAccounts?.some(
		(account) => account.provider === "discord",
	);

	useEffect(() => {
		async function fetchDiscordData() {
			if (!userLoaded || !isConnected) {
				setLoading(false);
				return;
			}

			try {
				const response = await fetch("/api/discord/data", {
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
				setDiscordUser(data.user);
				setGuilds(data.guilds);
				setChannels(data.channels);
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

		fetchDiscordData();
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
							<DiscordIcon className="h-6 w-6" />
							<span>Discord Integration</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground mb-4">
							Connect your Discord account to access your servers and channels.
						</p>
						<Button asChild>
							<Link href="">Connect Discord</Link>
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
							<Link href="/sign-in?redirect=/integrations/discord">
								Reconnect Discord
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
					<DiscordIcon className="h-8 w-8" />
					<div>
						<h2 className="text-2xl font-bold tracking-tight">
							Discord Integration
						</h2>
						<p className="text-muted-foreground">
							Manage your Discord servers and channels
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

			{/* User Profile */}
			{discordUser && (
				<Card>
					<CardHeader>
						<CardTitle>User Profile</CardTitle>
					</CardHeader>
					<CardContent className="flex items-center space-x-4">
						{discordUser.avatar && (
							<img
								src={`https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`}
								alt={discordUser.username}
								className="w-16 h-16 rounded-full"
							/>
						)}
						<div>
							<h3 className="text-lg font-medium">
								{discordUser.username}#{discordUser.discriminator}
							</h3>
							{discordUser.email && (
								<p className="text-sm text-muted-foreground">
									Email: {discordUser.email}
								</p>
							)}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Guilds (Servers) */}
			<Card>
				<CardHeader>
					<CardTitle>Servers</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4">
						{guilds.length === 0 && (
							<p className="text-muted-foreground">No servers found.</p>
						)}
						{guilds.map((guild) => (
							<div
								key={guild.id}
								className="flex items-center justify-between border-b py-2"
							>
								<div className="flex items-center space-x-3">
									{guild.icon && (
										<img
											src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
											alt={guild.name}
											className="w-8 h-8 rounded-full"
										/>
									)}
									<div>
										<span className="text-blue-500">{guild.name}</span>
										<div className="flex items-center space-x-4 mt-1">
											<span className="text-sm text-muted-foreground">
												{guild.owner ? "Owner" : "Member"}
											</span>
										</div>
									</div>
								</div>
								<Button variant="outline" disabled>
									View Channels
								</Button>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Channels (from the first guild) */}
			{guilds.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>Channels (from {guilds[0].name})</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4">
							{channels.length === 0 && (
								<p className="text-muted-foreground">No channels found.</p>
							)}
							{channels
								.filter((channel) => channel.type === 0) // Text channels only
								.map((channel) => (
									<div
										key={channel.id}
										className="flex items-center justify-between border-b py-2"
									>
										<div className="flex items-center space-x-3">
											<Hash className="h-5 w-5 text-muted-foreground" />
											<div>
												<span className="text-blue-500">{channel.name}</span>
											</div>
										</div>
										<Button variant="outline" disabled>
											View Messages
										</Button>
									</div>
								))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
