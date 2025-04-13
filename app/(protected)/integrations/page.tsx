"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Mail,
	MessageSquare,
	FileText,
	Book,
	Slack,
	FileIcon,
	Settings,
	Plus,
	ExternalLink,
	CheckCircle2,
	AlertCircle,
	Loader2,
} from "lucide-react";
import { GmailIcon } from "@/components/ui/icons/gmail";
import { DiscordIcon } from "@/components/ui/icons/discord";
import { SlackIcon } from "@/components/ui/icons/slack";
import { MsTeamsIcon } from "@/components/ui/icons/ms-teams";
import { GoogleCalendarIcon } from "@/components/ui/icons/google-calendar";
import { GoogleDocsIcon } from "@/components/ui/icons/google-docs";
import { NotionIcon } from "@/components/ui/icons/notion";
import { LinearIcon } from "@/components/ui/icons/linear";
import { GithubIcon } from "@/components/ui/icons/github";
import Link from "next/link";
import { useState } from "react";
import type { UserResource } from "@clerk/types";
import type { FC } from "react";

type Integration = {
	name: string;
	description: string;
	icon: FC<{ className?: string; size?: number }>;
	getStatus: (
		user: UserResource | null | undefined,
	) => "connected" | "disconnected";
	bgColor: string;
	iconColor: string;
	link: string;
	provider: string;
	disabled?: boolean;
	status?: string;
};

const integrationCategories: {
	title: string;
	description: string;
	integrations: Integration[];
}[] = [
	{
		title: "Productivity",
		description:
			"Integrate with your productivity and project management tools",
		integrations: [
			{
				name: "GitHub",
				description: "Access repositories and issues from your GitHub account",
				icon: GithubIcon,
				getStatus: (user: UserResource | null | undefined) =>
					user?.externalAccounts?.some(
						(account) => account.provider === "github",
					)
						? "connected"
						: "disconnected",
				bgColor: "bg-gray-500/10",
				iconColor: "text-gray-500",
				link: "/integrations/github",
				provider: "github",
			},
			{
				name: "Notion",
				description: "Access pages and databases from your Notion workspace",
				icon: NotionIcon,
				getStatus: (user: UserResource | null | undefined) =>
					user?.externalAccounts?.some(
						(account) => account.provider === "notion",
					)
						? "connected"
						: "disconnected",
				bgColor: "bg-stone-500/10",
				iconColor: "text-stone-500",
				link: "/integrations/notion",
				provider: "notion",
			},
			{
				name: "Linear",
				description: "Access issues and teams from your Linear workspace",
				icon: LinearIcon,
				getStatus: (user: UserResource | null | undefined) =>
					user?.externalAccounts?.some(
						(account) => account.provider === "linear",
					)
						? "connected"
						: "disconnected",
				bgColor: "bg-violet-500/10",
				iconColor: "text-violet-500",
				link: "/integrations/linear",
				provider: "linear",
			},
			{
				name: "Google Calendar",
				description: "Sync events and schedules from Google Calendar",
				icon: GoogleCalendarIcon,
				getStatus: (user: UserResource | null | undefined) =>
					user?.externalAccounts?.some(
						(account) =>
							account.provider === "google" &&
							account.approvedScopes.includes(
								"https://www.googleapis.com/auth/calendar.app.created",
							) &&
							account.approvedScopes.includes(
								"https://www.googleapis.com/auth/calendar.calendarlist.readonly",
							),
					)
						? "connected"
						: "disconnected",
				bgColor: "bg-blue-500/10",
				iconColor: "text-blue-500",
				link: "/integrations/google-calendar",
				provider: "google",
				disabled: true,
				status: "Soon",
			},
			{
				name: "Google Docs",
				description: "Access and sync documents from Google Docs",
				icon: GoogleDocsIcon,
				getStatus: (user: UserResource | null | undefined) =>
					user?.externalAccounts?.some(
						(account) =>
							account.provider === "google" &&
							account.approvedScopes.includes(
								"https://www.googleapis.com/auth/drive.file",
							),
					)
						? "connected"
						: "disconnected",
				bgColor: "bg-blue-500/10",
				iconColor: "text-blue-500",
				link: "/integrations/google-docs",
				provider: "google",
				disabled: true,
				status: "Soon",
			},
		],
	},
	{
		title: "Communication",
		description: "Connect your communication and team collaboration tools",
		integrations: [
			{
				name: "Discord",
				description: "Import messages and files from Discord channels",
				icon: DiscordIcon,
				getStatus: (user: UserResource | null | undefined) =>
					user?.externalAccounts?.some(
						(account) => account.provider === "discord",
					)
						? "connected"
						: "disconnected",
				bgColor: "bg-indigo-500/10",
				iconColor: "text-indigo-500",
				link: "/integrations/discord",
				provider: "discord",
			},
			{
				name: "Slack",
				description: "Sync messages and threads from Slack workspaces",
				icon: SlackIcon,
				getStatus: (user: UserResource | null | undefined) =>
					user?.externalAccounts?.some(
						(account) => account.provider === "slack",
					)
						? "connected"
						: "disconnected",
				bgColor: "bg-green-500/10",
				iconColor: "text-green-500",
				link: "/integrations/slack",
				provider: "slack",
				disabled: true,
				status: "Soon",
			},
			{
				name: "Gmail",
				description: "Sync emails and attachments from your Gmail account",
				icon: GmailIcon,
				getStatus: (user: UserResource | null | undefined) =>
					user?.externalAccounts?.some(
						(account) =>
							account.provider === "google" &&
							account.approvedScopes.includes(
								"https://www.googleapis.com/auth/gmail.addons.current.message.action",
							),
					)
						? "connected"
						: "disconnected",
				bgColor: "bg-red-500/10",
				iconColor: "text-red-500",
				link: "/integrations/gmail",
				provider: "google",
				disabled: true,
				status: "Soon",
			},
			{
				name: "Microsoft Teams",
				description: "Sync messages and threads from Microsoft Teams",
				icon: MsTeamsIcon,
				getStatus: (user: UserResource | null | undefined) =>
					user?.externalAccounts?.some(
						(account) => account.provider === "microsoft",
					)
						? "connected"
						: "disconnected",
				bgColor: "bg-blue-500/10",
				iconColor: "text-blue-500",
				link: "/integrations/microsoft-teams",
				disabled: true,
				status: "Soon",
				provider: "microsoft",
			},
		],
	},
];

export default function IntegrationsPage() {
	const { user } = useUser();
	const { signOut } = useClerk();
	const [error, setError] = useState<{
		message: string;
		details?: unknown;
	} | null>(null);
	const [activeTab, setActiveTab] = useState("all");
	const [isLoading, setIsLoading] = useState<string | null>(null);
	console.log({ user });

	const handleDisconnect = async (provider: string) => {
		try {
			setIsLoading(provider);
			const externalAccount = user?.externalAccounts.find(
				(account) => account.provider === provider,
			);

			if (!externalAccount) {
				throw new Error(`No external account found for provider ${provider}`);
			}

			await externalAccount.destroy();

			// Refresh the page to update the UI
			window.location.reload();
		} catch (err) {
			console.error("Error disconnecting account:", err);
			setError({
				message: "Failed to disconnect account",
				details: err,
			});
		} finally {
			setIsLoading(null);
		}
	};

	return (
		<div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
			<div className="flex items-center justify-between space-y-2">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Integrations</h2>
					<p className="text-muted-foreground">
						Manage and configure your service integrations
					</p>
				</div>
				<div className="flex items-center space-x-2">
					<Button>
						<Settings className="mr-2 h-4 w-4" />
						Settings
					</Button>
				</div>
			</div>

			{error && (
				<Card className="border-red-500">
					<CardContent className="pt-6">
						<p className="text-red-500">Error: {error.message}</p>
						<pre className="text-sm text-gray-500 mt-2">
							Details: {JSON.stringify(error.details ?? {}, null, 2)}
						</pre>
					</CardContent>
				</Card>
			)}

			<Tabs
				defaultValue="all"
				className="space-y-6"
				onValueChange={setActiveTab}
			>
				<div className="flex items-center justify-between">
					<TabsList>
						<TabsTrigger value="all">All</TabsTrigger>
						<TabsTrigger value="connected">Connected</TabsTrigger>
						<TabsTrigger value="available">Available</TabsTrigger>
					</TabsList>
					<div className="flex items-center space-x-2">
						<Input
							placeholder="Search integrations..."
							className="h-8 w-[150px] lg:w-[250px]"
						/>
					</div>
				</div>

				<TabsContent value="all" className="space-y-8">
					{integrationCategories.map((category) => (
						<div key={category.title} className="space-y-4">
							<div>
								<h3 className="text-lg font-semibold">{category.title}</h3>
								<p className="text-sm text-muted-foreground">
									{category.description}
								</p>
							</div>
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								{category.integrations.map((integration) => (
									<Card key={integration.name}>
										<CardHeader
											className={`space-y-1 ${integration.disabled ? "opacity-60" : ""}`}
										>
											<div className="flex items-center space-x-4">
												<div
													className={`p-2 rounded-md ${integration.bgColor}`}
												>
													<integration.icon
														className={`h-6 w-6 ${integration.iconColor}`}
													/>
												</div>
												<div className="flex-1">
													<div className="flex items-center justify-between">
														<CardTitle className="text-xl">
															{integration.name}
														</CardTitle>
														{user &&
														integration.getStatus(user) === "connected" ? (
															<Badge
																variant="default"
																className="bg-green-500/10 text-green-500 hover:bg-green-500/20"
															>
																<CheckCircle2 className="mr-1 h-3 w-3" />
																Connected
															</Badge>
														) : (
															<Badge
																variant="secondary"
																className={
																	integration.disabled
																		? "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
																		: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
																}
															>
																{integration.disabled ? (
																	<>
																		<AlertCircle className="mr-1 h-3 w-3" />
																		{integration.status}
																	</>
																) : (
																	<>
																		<AlertCircle className="mr-1 h-3 w-3" />
																		Setup Required
																	</>
																)}
															</Badge>
														)}
													</div>
												</div>
											</div>
										</CardHeader>
										<CardContent
											className={`space-y-4 ${integration.disabled ? "opacity-60" : ""}`}
										>
											<div className="space-y-2">
												<CardDescription>
													{integration.description}
												</CardDescription>
												{integration.disabled && (
													<p className="text-sm text-muted-foreground italic">
														This integration is coming soon
													</p>
												)}
											</div>
											<div className="flex space-x-2">
												{user && integration.getStatus(user) === "connected" ? (
													<>
														<Button
															variant="outline"
															className="flex-1"
															asChild
														>
															<Link href={integration.link || "#"}>
																Configure
															</Link>
														</Button>
														<Button
															variant="outline"
															className="flex-1"
															onClick={() =>
																handleDisconnect(integration.provider)
															}
															disabled={isLoading === integration.provider}
														>
															{isLoading === integration.provider ? (
																<>
																	<Loader2 className="mr-2 h-4 w-4 animate-spin" />
																	Disconnecting...
																</>
															) : (
																"Disconnect"
															)}
														</Button>
													</>
												) : (
													<Button
														className="flex-1"
														asChild
														disabled={integration.disabled}
													>
														<Link
															href={`/sign-in?redirect=/integrations/${integration.name.toLowerCase()}`}
														>
															<Plus className="mr-2 h-4 w-4" />
															Connect
														</Link>
													</Button>
												)}
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</div>
					))}
				</TabsContent>

				<TabsContent value="connected" className="space-y-8">
					{integrationCategories.map((category) => {
						const connectedIntegrations = category.integrations.filter(
							(integration) =>
								user && integration.getStatus(user) === "connected",
						);

						if (connectedIntegrations.length === 0) return null;

						return (
							<div key={category.title} className="space-y-4">
								<div>
									<h3 className="text-lg font-semibold">{category.title}</h3>
									<p className="text-sm text-muted-foreground">
										{category.description}
									</p>
								</div>
								<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
									{connectedIntegrations.map((integration) => (
										<Card key={integration.name}>
											<CardHeader
												className={`space-y-1 ${integration.disabled ? "opacity-60" : ""}`}
											>
												<div className="flex items-center space-x-4">
													<div
														className={`p-2 rounded-md ${integration.bgColor}`}
													>
														<integration.icon
															className={`h-6 w-6 ${integration.iconColor}`}
														/>
													</div>
													<div className="flex-1">
														<div className="flex items-center justify-between">
															<CardTitle className="text-xl">
																{integration.name}
															</CardTitle>
															<Badge
																variant="default"
																className="bg-green-500/10 text-green-500 hover:bg-green-500/20"
															>
																<CheckCircle2 className="mr-1 h-3 w-3" />
																Connected
															</Badge>
														</div>
													</div>
												</div>
											</CardHeader>
											<CardContent
												className={`space-y-4 ${integration.disabled ? "opacity-60" : ""}`}
											>
												<div className="space-y-2">
													<CardDescription>
														{integration.description}
													</CardDescription>
													{integration.disabled && (
														<p className="text-sm text-muted-foreground italic">
															This integration is coming soon
														</p>
													)}
												</div>
												<div className="flex space-x-2">
													<Button variant="outline" className="flex-1" asChild>
														<Link href={integration.link || "#"}>
															Configure
														</Link>
													</Button>
													<Button variant="outline" className="flex-1" disabled>
														Disconnect
													</Button>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</div>
						);
					})}
				</TabsContent>

				<TabsContent value="available" className="space-y-8">
					{integrationCategories.map((category) => {
						const availableIntegrations = category.integrations.filter(
							(integration) =>
								!integration.disabled &&
								(!user || integration.getStatus(user) !== "connected"),
						);

						if (availableIntegrations.length === 0) return null;

						return (
							<div key={category.title} className="space-y-4">
								<div>
									<h3 className="text-lg font-semibold">{category.title}</h3>
									<p className="text-sm text-muted-foreground">
										{category.description}
									</p>
								</div>
								<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
									{availableIntegrations.map((integration) => (
										<Card key={integration.name}>
											<CardHeader
												className={`space-y-1 ${integration.disabled ? "opacity-60" : ""}`}
											>
												<div className="flex items-center space-x-4">
													<div
														className={`p-2 rounded-md ${integration.bgColor}`}
													>
														<integration.icon
															className={`h-6 w-6 ${integration.iconColor}`}
														/>
													</div>
													<div className="flex-1">
														<div className="flex items-center justify-between">
															<CardTitle className="text-xl">
																{integration.name}
															</CardTitle>
															<Badge
																variant="secondary"
																className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
															>
																<AlertCircle className="mr-1 h-3 w-3" />
																Setup Required
															</Badge>
														</div>
													</div>
												</div>
											</CardHeader>
											<CardContent
												className={`space-y-4 ${integration.disabled ? "opacity-60" : ""}`}
											>
												<div className="space-y-2">
													<CardDescription>
														{integration.description}
													</CardDescription>
													{integration.disabled && (
														<p className="text-sm text-muted-foreground italic">
															This integration is coming soon
														</p>
													)}
												</div>
												<div className="flex space-x-2">
													<Button className="flex-1" asChild>
														<Link
															href={`/sign-in?redirect=/integrations/${integration.name.toLowerCase()}`}
														>
															<Plus className="mr-2 h-4 w-4" />
															Connect
														</Link>
													</Button>
												</div>
											</CardContent>
										</Card>
									))}
								</div>
							</div>
						);
					})}
				</TabsContent>
			</Tabs>
		</div>
	);
}
