"use client";

import {
	ChevronDown,
	LayoutGrid,
	Settings,
	FileText,
	FolderOpen,
} from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarGroup,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
	Collapsible,
	CollapsibleTrigger,
	CollapsibleContent,
} from "@/components/ui/collapsible";
import { SlackIcon } from "@/components/ui/icons/slack";
import { DiscordIcon } from "@/components/ui/icons/discord";
import { MsTeamsIcon } from "@/components/ui/icons/ms-teams";
import { GmailIcon } from "@/components/ui/icons/gmail";
import { GoogleCalendarIcon } from "@/components/ui/icons/google-calendar";
import { GoogleDocsIcon } from "@/components/ui/icons/google-docs";
import { NotionIcon } from "@/components/ui/icons/notion";
import { LinearIcon } from "@/components/ui/icons/linear";
import { GithubIcon } from "@/components/ui/icons/github";
import Link from "next/link";
import { Input } from "./ui/input";
import {
	SignInButton,
	SignUpButton,
	SignedIn,
	SignedOut,
	UserButton,
	useUser,
} from "@clerk/nextjs";
import { CommandMenu } from "./command-menu";
import { NewDocumentButton } from "./new-document-button";
import { useState } from "react";

interface Document {
	id: string;
	name: string;
	content?: string;
	createdAt?: string;
}

export function MinimalIntegrationSidebar({ documents = [] as Document[] }) {
	const user = useUser();

	const integrations = [
		{ name: "GitHub", icon: GithubIcon, link: "/integrations/github" },
		{ name: "Notion", icon: NotionIcon, link: "/integrations/notion" },
		{ name: "Linear", icon: LinearIcon, link: "/integrations/linear" },
		{ name: "Discord", icon: DiscordIcon, link: "/integrations/discord" },
		{
			name: "Slack",
			icon: SlackIcon,
			link: "/integrations/slack",
			disabled: true,
			status: "Soon",
		},
		{
			name: "Gmail",
			icon: GmailIcon,
			link: "/integrations/gmail",
			disabled: true,
			status: "Soon",
		},
		{
			name: "Google Calendar",
			icon: GoogleCalendarIcon,
			link: "/integrations/google-calendar",
			disabled: true,
			status: "Soon",
		},
		{
			name: "Google Docs",
			icon: GoogleDocsIcon,
			link: "/integrations/google-docs",
			disabled: true,
			status: "Soon",
		},
		{
			name: "Microsoft Teams",
			icon: MsTeamsIcon,
			link: "/integrations/microsoft-teams",
			disabled: true,
			status: "Soon",
		},
	];

	return (
		<Sidebar
			collapsible="icon"
			className="bg-background text-foreground border-r border-border"
		>
			{/* Header with User Name */}
			<SidebarHeader className="px-3 py-4">
				<div className="flex items-center space-x-2 group-data-[collapsible=icon]:justify-center">
					<SignedOut>
						<SignInButton />
						<SignUpButton />
					</SignedOut>
					<SignedIn>
						<UserButton />
					</SignedIn>
					{user.user && (
						<span className="text-xs font-medium group-data-[collapsible=icon]:hidden">
							{user.user.fullName}
						</span>
					)}
				</div>
			</SidebarHeader>

			<SidebarContent>
				{/* Command Menu */}
				<SidebarGroup className="px-3">
					<CommandMenu
						documents={documents}
						onCreateDocument={() => {
							const newDocButton = document.querySelector(
								"[data-new-doc-trigger]",
							);
							if (newDocButton instanceof HTMLElement) {
								newDocButton.click();
							}
						}}
					/>
				</SidebarGroup>

				{/* Main Navigation */}
				<SidebarGroup>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								className="w-full justify-start space-x-2 group-data-[collapsible=icon]:justify-center py-1.5 px-3"
							>
								<Link href="/">
									<LayoutGrid className="h-3 w-3 text-muted-foreground" />
									<span className="text-sm group-data-[collapsible=icon]:hidden">
										Home
									</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>

						{/* Documents Section */}
						<SidebarMenuItem>
							<Collapsible defaultOpen={true} className="w-full">
								<CollapsibleTrigger asChild>
									<SidebarMenuButton className="w-full space-x-2 group-data-[collapsible=icon]:justify-center py-1.5 px-3 text-muted-foreground hover:bg-muted hover:text-foreground">
										<FolderOpen className="h-3 w-3 text-muted-foreground" />
										<span className="text-sm font-medium tracking-wide group-data-[collapsible=icon]:hidden">
											My Documents
										</span>
										<ChevronDown className="ml-auto h-3 w-3 transition-transform group-data-[state=open]/collapsible:rotate-180 group-data-[collapsible=icon]:hidden" />
									</SidebarMenuButton>
								</CollapsibleTrigger>
								<CollapsibleContent>
									<div className="space-y-1 py-1">
										{documents.map((doc) => (
											<div key={doc.id} className="px-3">
												<Link
													href={`/docs/${doc.id}`}
													className="flex w-full px-2 items-center gap-2 rounded-lg py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
												>
													<FileText className="h-3 w-3 mr-1" />
													<span className="group-data-[collapsible=icon]:hidden truncate">
														{doc.name}
													</span>
												</Link>
											</div>
										))}
										<div className="px-3">
											<NewDocumentButton className="w-full justify-start pl-2" />
										</div>
									</div>
								</CollapsibleContent>
							</Collapsible>
						</SidebarMenuItem>

						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								className="w-full justify-start space-x-2 group-data-[collapsible=icon]:justify-center py-1.5 px-3"
							>
								<Link href="/references">
									<FileText className="h-3 w-3 text-muted-foreground" />
									<span className="text-sm group-data-[collapsible=icon]:hidden">
										References
									</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<Collapsible defaultOpen={false} className="w-full">
								<CollapsibleTrigger asChild>
									<SidebarMenuButton className="w-full space-x-2 group-data-[collapsible=icon]:justify-center py-1.5 px-3 text-muted-foreground hover:bg-muted hover:text-foreground">
										<Settings className="h-3 w-3 text-muted-foreground" />
										<span className="text-sm font-medium tracking-wide group-data-[collapsible=icon]:hidden">
											Integrations
										</span>
										<ChevronDown className="ml-auto h-3 w-3 transition-transform group-data-[state=open]/collapsible:rotate-180 group-data-[collapsible=icon]:hidden" />
									</SidebarMenuButton>
								</CollapsibleTrigger>
								<CollapsibleContent>
									<div className="space-y-1 py-1">
										{integrations.map((integration) => (
											<div
												key={integration.name}
												className={`px-3 ${
													integration.disabled
														? "opacity-50 cursor-not-allowed"
														: ""
												}`}
											>
												{!integration.disabled && (
													<Link
														href={integration.link}
														className="flex w-full px-2 items-center gap-2 rounded-lg py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
													>
														<integration.icon className="h-3 w-3 mr-1" />
														<span className="group-data-[collapsible=icon]:hidden">
															{integration.name}
														</span>
													</Link>
												)}
											</div>
										))}
										<div className="px-3">
											<Link
												href="/integrations"
												className="flex w-full items-center gap-2 rounded-lg py-1.5 text-sm font-medium text-primary hover:bg-muted"
											>
												View all integrations
											</Link>
										</div>
									</div>
								</CollapsibleContent>
							</Collapsible>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
