"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinearIcon } from "@/components/ui/icons/linear";
import { useUser } from "@clerk/nextjs";
import { CheckCircle2, FileText, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface LinearUser {
	id: string;
	name: string;
	email: string;
	displayName: string;
}

interface LinearIssue {
	id: string;
	title: string;
	description: string;
	url: string;
	createdAt: string;
	updatedAt: string;
}

interface LinearTeam {
	id: string;
	name: string;
	description: string;
	createdAt: string;
}

export default function LinearIntegrationPage() {
	const { user, isLoaded: userLoaded } = useUser();
	const [linearUser, setLinearUser] = useState<LinearUser | null>(null);
	const [issues, setIssues] = useState<LinearIssue[]>([]);
	const [teams, setTeams] = useState<LinearTeam[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<{
		message: string;
		details?: unknown;
	} | null>(null);

	const isConnected = user?.externalAccounts?.some(
		(account) => account.provider === "linear",
	);

	useEffect(() => {
		async function fetchLinearData() {
			if (!userLoaded || !isConnected) {
				setLoading(false);
				return;
			}

			try {
				const response = await fetch("/api/linear/data", {
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
				setLinearUser(data.user);
				setIssues(data.issues);
				setTeams(data.teams);
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

		fetchLinearData();
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
							<LinearIcon className="h-6 w-6" />
							<span>Linear Integration</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="mb-4 text-muted-foreground">
							Connect your Linear account to view your issues and teams.
						</p>
						<Button asChild>
							<Link href="/sign-in?redirect=/integrations/linear">
								Connect Linear
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
							<Link href="/sign-in?redirect=/integrations/linear">
								Reconnect Linear
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
					<LinearIcon className="h-8 w-8" />
					<div>
						<h2 className="font-bold text-2xl tracking-tight">
							Linear Integration
						</h2>
						<p className="text-muted-foreground">
							Manage your Linear issues and teams
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
			{linearUser && (
				<Card>
					<CardHeader>
						<CardTitle>User Profile</CardTitle>
					</CardHeader>
					<CardContent className="flex items-center space-x-4">
						<div>
							<h3 className="font-medium text-lg">{linearUser.displayName}</h3>
							<p className="text-muted-foreground text-sm">
								Name: {linearUser.name}
							</p>
							<p className="text-muted-foreground text-sm">
								Email: {linearUser.email}
							</p>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Issues */}
			<Card>
				<CardHeader>
					<CardTitle>Assigned Issues</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4">
						{issues.length === 0 && (
							<p className="text-muted-foreground">
								No issues assigned to you.
							</p>
						)}
						{issues.map((issue) => (
							<div
								key={issue.id}
								className="flex items-center justify-between border-b py-2"
							>
								<div className="flex items-center space-x-3">
									<FileText className="h-5 w-5 text-muted-foreground" />
									<div>
										<Link
											href={issue.url}
											target="_blank"
											className="text-blue-500 hover:underline"
										>
											{issue.title}
										</Link>
										<div className="mt-1 flex items-center space-x-4">
											<span className="text-muted-foreground text-sm">
												Created:{" "}
												{new Date(issue.createdAt).toLocaleDateString()}
											</span>
											<span className="text-muted-foreground text-sm">
												Updated:{" "}
												{new Date(issue.updatedAt).toLocaleDateString()}
											</span>
										</div>
										<p className="mt-1 text-muted-foreground text-sm">
											{issue.description}
										</p>
									</div>
								</div>
								<Button variant="outline" asChild>
									<Link href={issue.url} target="_blank">
										View in Linear
									</Link>
								</Button>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Teams */}
			<Card>
				<CardHeader>
					<CardTitle>Teams</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4">
						{teams.length === 0 && (
							<p className="text-muted-foreground">No teams found.</p>
						)}
						{teams.map((team) => (
							<div
								key={team.id}
								className="flex items-center justify-between border-b py-2"
							>
								<div className="flex items-center space-x-3">
									<Users className="h-5 w-5 text-muted-foreground" />
									<div>
										<span className="text-blue-500">{team.name}</span>
										<div className="mt-1 flex items-center space-x-4">
											<span className="text-muted-foreground text-sm">
												Created: {new Date(team.createdAt).toLocaleDateString()}
											</span>
										</div>
										<p className="mt-1 text-muted-foreground text-sm">
											{team.description}
										</p>
									</div>
								</div>
								<Button variant="outline" disabled>
									View Team
								</Button>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
