"use client";

import {
	Search,
	MessageSquare,
	Plus,
	ChevronDown,
	Home,
	Bell,
	Upload,
	Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarGroup,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarMenuSub,
	SidebarMenuSubItem,
	SidebarMenuSubButton,
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
import { Label } from "./ui/label";

const integrationCategories = [
	{
		title: "Productivity",
		integrations: [
			{ name: "GitHub", icon: GithubIcon, link: "/integrations/github" },
			{ name: "Notion", icon: NotionIcon, link: "/integrations/notion" },
			{ name: "Linear", icon: LinearIcon, link: "/integrations/linear" },
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
		],
	},
	{
		title: "Communication",
		integrations: [
			{ name: "Discord", icon: DiscordIcon, link: "/integrations/discord" },
			{ name: "Slack", icon: SlackIcon, link: "/integrations/slack" },
			{
				name: "Gmail",
				icon: GmailIcon,
				link: "/integrations/gmail",
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
		],
	},
];

export function MinimalIntegrationSidebar() {
	return (
		<Sidebar
			collapsible="icon"
			className="bg-background text-foreground border-r border-border"
		>
			{/* Header with User Name */}
			<SidebarHeader className="px-3 py-4">
				<div className="flex items-center space-x-2 group-data-[collapsible=icon]:justify-center">
					<svg
						aria-label="Railly Hugo"
						role="img"
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="currentColor"
					>
						<path d="M0 0h24v24H0z" fill="none" />
						<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
					</svg>

					<span className="text-xs font-medium group-data-[collapsible=icon]:hidden">
						Railly Hugo
					</span>
				</div>
			</SidebarHeader>

			<SidebarContent>
				{/* Search Bar */}
				<SidebarGroup className="px-3">
					<div className="relative">
						<Input
							id="search"
							className="pe-11"
							placeholder="Search..."
							type="search"
						/>
						<div className="text-muted-foreground pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-2">
							<kbd className="text-muted-foreground/70 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
								⌘K
							</kbd>
						</div>
					</div>
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
									<Home className="h-3 w-3 text-muted-foreground" />
									<span className="text-sm group-data-[collapsible=icon]:hidden">
										Home
									</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								className="w-full justify-start space-x-2 group-data-[collapsible=icon]:justify-center py-1.5 px-3"
							>
								<Link href="/writing">
									<MessageSquare className="h-3 w-3 text-muted-foreground" />
									<span className="text-sm group-data-[collapsible=icon]:hidden">
										Writing
									</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								className="w-full justify-start space-x-2 group-data-[collapsible=icon]:justify-center py-1.5 px-3"
							>
								<Link href="/notifications">
									<Bell className="h-3 w-3 text-muted-foreground" />
									<span className="text-sm group-data-[collapsible=icon]:hidden">
										Notifications
									</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								className="w-full justify-start space-x-2 group-data-[collapsible=icon]:justify-center py-1.5 px-3"
							>
								<Link href="/upload">
									<Upload className="h-3 w-3 text-muted-foreground" />
									<span className="text-sm group-data-[collapsible=icon]:hidden">
										Upload
									</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
						{/* one more for integrations */}
						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								className="w-full justify-start space-x-2 group-data-[collapsible=icon]:justify-center py-1.5 px-3"
							>
								<Link href="/integrations">
									<Settings className="h-3 w-3 text-muted-foreground" />
									<span className="text-sm group-data-[collapsible=icon]:hidden">
										Integrations
									</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>

				{/* Integration Categories */}
				<SidebarGroup>
					{integrationCategories.map((category) => (
						<Collapsible
							key={category.title}
							defaultOpen
							className="group/collapsible"
						>
							<SidebarMenuItem>
								<CollapsibleTrigger asChild>
									<SidebarMenuButton className="w-full justify-between space-x-2 group-data-[collapsible=icon]:justify-center py-1 px-3 text-muted-foreground hover:bg-muted hover:text-foreground">
										<span className="text-xs font-medium tracking-wide group-data-[collapsible=icon]:hidden">
											{category.title}
										</span>
										<ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]/collapsible:rotate-180 group-data-[collapsible=icon]:hidden" />
									</SidebarMenuButton>
								</CollapsibleTrigger>
								<CollapsibleContent>
									<SidebarMenuSub>
										{category.integrations.map((integration) => (
											<SidebarMenuSubItem key={integration.name}>
												<SidebarMenuSubButton
													asChild
													className={`w-full justify-start space-x-2 group-data-[collapsible=icon]:justify-center py-1 px-3 hover:bg-muted ${
														integration.disabled
															? "opacity-50 cursor-not-allowed"
															: ""
													}`}
												>
													<a
														href={integration.disabled ? "#" : integration.link}
														className="flex items-center"
														onClick={(e) =>
															integration.disabled && e.preventDefault()
														}
													>
														<integration.icon className="h-3 w-3" />
														<span className="text-sm text-foreground group-data-[collapsible=icon]:hidden ml-2">
															{integration.name}
														</span>
													</a>
												</SidebarMenuSubButton>
											</SidebarMenuSubItem>
										))}
									</SidebarMenuSub>
								</CollapsibleContent>
							</SidebarMenuItem>
						</Collapsible>
					))}
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
