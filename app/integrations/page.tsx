"use client";

import { Button } from "@/components/ui/button";
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
import {
	Github,
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

const integrationCategories = [
	{
		title: "Communication & Collaboration",
		description: "Connect your communication and team collaboration tools",
		integrations: [
			{
				name: "Gmail",
				description: "Sync emails and attachments from your Gmail account",
				icon: GmailIcon,
				status: "connected",
				bgColor: "bg-red-500/10",
				iconColor: "text-red-500",
			},
			{
				name: "Discord",
				description: "Import messages and files from Discord channels",
				icon: DiscordIcon,
				status: "disconnected",
				bgColor: "bg-indigo-500/10",
				iconColor: "text-indigo-500",
			},
			{
				name: "Slack",
				description: "Sync messages and threads from Slack workspaces",
				icon: SlackIcon,
				status: "connected",
				bgColor: "bg-green-500/10",
				iconColor: "text-green-500",
			},
		],
	},
	{
		title: "Development Tools",
		description: "Integrate with your development and project management tools",
		integrations: [
			{
				name: "GitHub",
				description: "Access repositories, issues, and pull requests",
				icon: GithubIcon,
				status: "connected",
				bgColor: "bg-slate-500/10",
				iconColor: "text-slate-500",
			},
			{
				name: "Linear",
				description: "Sync issues and project management data",
				icon: LinearIcon,
				status: "connected",
				bgColor: "bg-violet-500/10",
				iconColor: "text-violet-500",
			},
		],
	},
	{
		title: "Knowledge Management",
		description: "Connect your knowledge base and documentation tools",
		integrations: [
			{
				name: "Notion",
				description: "Import pages and documents from Notion workspaces",
				icon: NotionIcon,
				status: "connected",
				bgColor: "bg-stone-500/10",
				iconColor: "text-stone-500",
			},
			{
				name: "Confluence",
				description: "Access Confluence pages and attachments",
				icon: GoogleDocsIcon,
				status: "disconnected",
				bgColor: "bg-blue-500/10",
				iconColor: "text-blue-500",
			},
		],
	},
];

export default function IntegrationsPage() {
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

			<Tabs defaultValue="all" className="space-y-6">
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
								<h3 className="text-lg font-medium">{category.title}</h3>
								<p className="text-sm text-muted-foreground">
									{category.description}
								</p>
							</div>
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								{category.integrations.map((integration) => (
									<Card key={integration.name}>
										<CardHeader className="space-y-1">
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
														{integration.status === "connected" ? (
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
																className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
															>
																<AlertCircle className="mr-1 h-3 w-3" />
																Setup Required
															</Badge>
														)}
													</div>
												</div>
											</div>
										</CardHeader>
										<CardContent className="space-y-4">
											<CardDescription>
												{integration.description}
											</CardDescription>
											<div className="flex space-x-2">
												{integration.status === "connected" ? (
													<>
														<Button variant="outline" className="flex-1">
															Configure
														</Button>
														<Button variant="outline" className="flex-1">
															Disconnect
														</Button>
													</>
												) : (
													<Button className="flex-1">
														<Plus className="mr-2 h-4 w-4" />
														Connect
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
			</Tabs>
		</div>
	);
}
