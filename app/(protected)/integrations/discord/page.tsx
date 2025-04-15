"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DiscordIcon } from "@/components/ui/icons/discord";
import { useUser } from "@clerk/nextjs";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DiscordUser {
	id: string;
	username: string;
	discriminator: string;
	avatar?: string;
}

interface DiscordGuild {
	id: string;
	name: string;
	icon?: string;
	owner: boolean;
	permissions: string;
}

export default function DiscordIntegrationPage() {
	const { user, isLoaded: userLoaded } = useUser();
	const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null);
	const [guilds, setGuilds] = useState<DiscordGuild[]>([]);
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
			<div className="flex h-full items-center justify-center">
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
						<p className="mb-4 text-muted-foreground">
							Connect your Discord account to view your profile and servers.
						</p>
						<Button asChild>
							<Link href="/sign-in?redirect=/integrations/discord">
								Connect Discord
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
						<pre className="mt-2 text-gray-500 text-sm">
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
						<h2 className="font-bold text-2xl tracking-tight">
							Discord Integration
						</h2>
						<p className="text-muted-foreground">
							View your Discord profile and servers
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
								className="h-16 w-16 rounded-full"
							/>
						)}
						<div>
							<h3 className="font-medium text-lg">
								{discordUser.username}#{discordUser.discriminator}
							</h3>
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
											className="h-8 w-8 rounded-full"
										/>
									)}
									<div>
										<span className="text-blue-500">{guild.name}</span>
										<div className="mt-1 flex items-center space-x-4">
											<span className="text-muted-foreground text-sm">
												{guild.owner ? "Owner" : "Member"}
											</span>
										</div>
									</div>
								</div>
								<Button variant="outline" disabled>
									View Details
								</Button>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
