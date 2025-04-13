"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GithubIcon } from "@/components/ui/icons/github";
import { CheckCircle2, AlertCircle, Star, GitFork, Bell } from "lucide-react";
import Link from "next/link";

interface GitHubUser {
	login: string;
	name: string | null;
	avatar_url: string;
	bio: string | null;
	public_repos: number;
}

interface GitHubRepo {
	id: number;
	name: string;
	full_name: string;
	description: string | null;
	stargazers_count: number;
	forks_count: number;
	updated_at: string;
	html_url: string;
}

interface GitHubNotification {
	id: string;
	repository: { full_name: string };
	subject: { title: string; url: string | null };
	reason: string;
	updated_at: string;
}

export default function GitHubIntegrationPage() {
	const { user, isLoaded: userLoaded } = useUser();
	const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
	const [repos, setRepos] = useState<GitHubRepo[]>([]);
	const [notifications, setNotifications] = useState<GitHubNotification[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<{
		message: string;
		details?: unknown;
	} | null>(null);

	const isConnected = user?.externalAccounts?.some(
		(account) => account.provider === "github",
	);

	useEffect(() => {
		async function fetchGitHubData() {
			if (!userLoaded || !isConnected) {
				setLoading(false);
				return;
			}

			try {
				const response = await fetch("/api/github/data", {
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
				setGithubUser(data.user);
				setRepos(data.repos);
				setNotifications(data.notifications);
			} catch (err: unknown) {
				if (err instanceof Error) {
					setError({
						message: err.message,
						details: (err.cause as unknown as { details?: unknown })?.details,
					});
				} else {
					setError({ message: "An unknown error occurred" });
				}
			} finally {
				setLoading(false);
			}
		}

		fetchGitHubData();
	}, [userLoaded, isConnected]);

	const handleDisconnect = async () => {
		try {
			const response = await fetch("/api/github/disconnect", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error, { cause: errorData });
			}

			// Redirect to the integrations page after disconnecting
			window.location.href = "/integrations";
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError({
					message: err.message,
					details: (err.cause as unknown as { details?: unknown })?.details,
				});
			} else {
				setError({ message: "An unknown error occurred" });
			}
		}
	};

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
							<GithubIcon className="h-6 w-6" />
							<span>GitHub Integration</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground mb-4">
							Connect your GitHub account to access your repositories and
							notifications.
						</p>
						<Button asChild>
							<Link href="/sign-in?redirect=/integrations/github">
								Connect GitHub
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
							{JSON.stringify(error.details ?? {}, null, 2)}
						</pre>

						<Button variant="outline" className="mt-4" asChild>
							<Link href="/sign-in?redirect=/integrations/github">
								Reconnect GitHub
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
					<GithubIcon className="h-8 w-8" />
					<div>
						<h2 className="text-2xl font-bold tracking-tight">
							GitHub Integration
						</h2>
						<p className="text-muted-foreground">
							Manage your GitHub repositories and notifications
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
				<Button variant="outline" onClick={handleDisconnect}>
					Disconnect
				</Button>
			</div>

			{/* User Profile */}
			{githubUser && (
				<Card>
					<CardHeader>
						<CardTitle>User Profile</CardTitle>
					</CardHeader>
					<CardContent className="flex items-center space-x-4">
						<img
							src={githubUser.avatar_url}
							alt={githubUser.login}
							className="w-16 h-16 rounded-full"
						/>
						<div>
							<h3 className="text-lg font-medium">
								{githubUser.name || githubUser.login}
							</h3>
							{githubUser.bio && (
								<p className="text-sm text-muted-foreground">
									{githubUser.bio}
								</p>
							)}
							<p className="text-sm text-muted-foreground">
								Repositories: {githubUser.public_repos}
							</p>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Repositories */}
			<Card>
				<CardHeader>
					<CardTitle>Repositories</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4">
						{repos.map((repo) => (
							<div
								key={repo.id}
								className="flex items-center justify-between border-b py-2"
							>
								<div>
									<Link
										href={repo.html_url}
										target="_blank"
										className="text-blue-500 hover:underline"
									>
										{repo.full_name}
									</Link>
									{repo.description && (
										<p className="text-sm text-muted-foreground">
											{repo.description}
										</p>
									)}
									<div className="flex items-center space-x-4 mt-1">
										<span className="flex items-center text-sm text-muted-foreground">
											<Star className="h-4 w-4 mr-1" />
											{repo.stargazers_count}
										</span>
										<span className="flex items-center text-sm text-muted-foreground">
											<GitFork className="h-4 w-4 mr-1" />
											{repo.forks_count}
										</span>
										<span className="text-sm text-muted-foreground">
											Updated: {new Date(repo.updated_at).toLocaleDateString()}
										</span>
									</div>
								</div>
								<Button variant="outline" asChild>
									<Link href={`/integrations/github/repos/${repo.name}`}>
										View Details
									</Link>
								</Button>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Notifications */}
			<Card>
				<CardHeader>
					<CardTitle>Notifications</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4">
						{notifications.length === 0 && (
							<p className="text-muted-foreground">No notifications found.</p>
						)}
						{notifications.map((notification) => (
							<div
								key={notification.id}
								className="flex items-center justify-between border-b py-2"
							>
								<div>
									<p className="text-sm font-medium">
										{notification.subject.title}
									</p>
									<p className="text-sm text-muted-foreground">
										{notification.repository.full_name} ({notification.reason})
									</p>
									<p className="text-sm text-muted-foreground">
										Updated:{" "}
										{new Date(notification.updated_at).toLocaleDateString()}
									</p>
								</div>
								{notification.subject.url && (
									<Button variant="outline" asChild>
										<Link
											href={notification.subject.url.replace(
												"api.github.com/repos",
												"github.com",
											)}
											target="_blank"
										>
											View
										</Link>
									</Button>
								)}
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
