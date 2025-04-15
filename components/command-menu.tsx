"use client";

import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import { DialogContent } from "@/components/ui/dialog";
import { DiscordIcon } from "@/components/ui/icons/discord";
import { GithubIcon } from "@/components/ui/icons/github";
import { GmailIcon } from "@/components/ui/icons/gmail";
import { GoogleCalendarIcon } from "@/components/ui/icons/google-calendar";
import { GoogleDocsIcon } from "@/components/ui/icons/google-docs";
import { LinearIcon } from "@/components/ui/icons/linear";
import { MsTeamsIcon } from "@/components/ui/icons/ms-teams";
import { NotionIcon } from "@/components/ui/icons/notion";
import { SlackIcon } from "@/components/ui/icons/slack";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import {
	ArrowUp,
	Book,
	Copy,
	FileText,
	LayoutGrid,
	Plus,
	Search,
	Settings,
	Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useState } from "react";

interface Document {
	id: string;
	name: string;
	content?: string;
	createdAt?: string;
}

interface CommandMenuProps {
	documents?: Document[];
	onCreateDocument?: () => void;
	variant?: "default" | "icon";
}

export function CommandMenu({
	documents = [],
	onCreateDocument,
	variant = "default",
}: CommandMenuProps) {
	const [open, setOpen] = useState(false);
	const router = useRouter();

	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};
		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

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
		<>
			{variant === "default" ? (
				<SidebarMenuButton
					variant="outline"
					tooltip="Search documents and navigation"
					size="default"
					onClick={() => setOpen(true)}
					className="relative border border-border px-2 !h-9 dark:bg-muted w-full flex items-center text-sm text-muted-foreground justify-between"
				>
					<span className="inline-flex w-full justify-between items-center">
						<span className="flex items-center gap-2">
							<Search className="h-4 w-4" />
							Search or press
						</span>
						<kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-foreground sm:flex">
							<span className="text-xs">⌘</span>K
						</kbd>
					</span>
				</SidebarMenuButton>
			) : (
				<SidebarMenuButton
					variant="outline"
					size="sm"
					tooltip="Search"
					onClick={() => setOpen(true)}
					className="h-8 w-8 p-0 dark:bg-muted border border-border"
				>
					<Search className="h-4 w-4 text-muted-foreground" />
					<span className="sr-only">Search</span>
				</SidebarMenuButton>
			)}

			<CommandDialog open={open} onOpenChange={setOpen}>
				<DialogContent
					className="overflow-hidden p-0 !rounded-xl border shadow-[0px_1px_1px_rgba(0,0,0,0.02),_0px_8px_16px_-4px_rgba(0,0,0,0.04),_0px_24px_32px_-8px_rgba(0,0,0,0.06)] max-w-[640px]"
					title="Command Menu"
				>
					<div className="relative flex flex-col overflow-hidden">
						<Command className="border-0">
							<CommandInput
								placeholder="What do you need?"
								className="h-12 border-0 focus:ring-0 text-lg placeholder:text-muted-foreground/50"
							/>

							<CommandList className="overflow-y-auto min-h-[400px]">
								<CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
									No results found.
								</CommandEmpty>

								<CommandGroup
									heading="Documents"
									className="px-2 py-1.5 text-sm text-muted-foreground font-medium [&_[cmdk-group-heading]]:text-muted-foreground/70 [&_[cmdk-group-heading]]:font-normal [&_[cmdk-group-heading]]:text-[13px] [&_[cmdk-group-heading]]:py-2.5"
								>
									<CommandItem
										onSelect={() => {
											onCreateDocument?.();
											setOpen(false);
										}}
										className="flex items-center gap-3 py-2.5 px-2 cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
									>
										<Plus className="h-4 w-4 text-muted-foreground/70" />
										<span className="font-medium">Create New Document</span>
										<div className="flex items-center ml-auto">
											<div className="flex items-center justify-center border bg-background text-xs p-0.5 rounded">
												<ArrowUp className="h-3 w-3" />
											</div>
											<div className="flex items-center justify-center border bg-background text-xs py-0.5 px-1.5 rounded ml-1">
												N
											</div>
										</div>
									</CommandItem>

									{documents.map((doc) => (
										<CommandItem
											key={doc.id}
											onSelect={() => {
												router.push(`/docs/${doc.id}`);
												setOpen(false);
											}}
											className="flex items-center gap-3 py-2.5 px-2 cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
										>
											<FileText className="h-4 w-4 text-muted-foreground/70" />
											<span className="font-medium">{doc.name}</span>
										</CommandItem>
									))}
								</CommandGroup>

								<CommandSeparator />

								<CommandGroup
									heading="Integrations"
									className="px-2 py-1.5 text-sm text-muted-foreground font-medium [&_[cmdk-group-heading]]:text-muted-foreground/70 [&_[cmdk-group-heading]]:font-normal [&_[cmdk-group-heading]]:text-[13px] [&_[cmdk-group-heading]]:py-2.5"
								>
									{integrations.map((integration) => (
										<CommandItem
											key={integration.name}
											onSelect={() => {
												if (!integration.disabled) {
													router.push(integration.link);
													setOpen(false);
												}
											}}
											disabled={integration.disabled}
											className="flex items-center gap-3 py-2.5 px-2 cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
										>
											<integration.icon className="h-4 w-4 text-muted-foreground/70" />
											<span className="font-medium">{integration.name}</span>
											{integration.status && (
												<span className="ml-auto text-xs text-muted-foreground">
													{integration.status}
												</span>
											)}
										</CommandItem>
									))}
								</CommandGroup>

								<CommandSeparator />

								<CommandGroup
									heading="Navigation"
									className="px-2 py-1.5 text-sm text-muted-foreground font-medium [&_[cmdk-group-heading]]:text-muted-foreground/70 [&_[cmdk-group-heading]]:font-normal [&_[cmdk-group-heading]]:text-[13px] [&_[cmdk-group-heading]]:py-2.5"
								>
									<CommandItem
										onSelect={() => {
											router.push("/");
											setOpen(false);
										}}
										className="flex items-center gap-3 py-2.5 px-2 cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
									>
										<LayoutGrid className="h-4 w-4 text-muted-foreground/70" />
										<span className="font-medium">Home</span>
										<div className="flex items-center ml-auto">
											<div className="flex items-center justify-center border bg-background text-xs py-0.5 px-1.5 rounded">
												H
											</div>
										</div>
									</CommandItem>
									<CommandItem
										onSelect={() => {
											router.push("/references");
											setOpen(false);
										}}
										className="flex items-center gap-3 py-2.5 px-2 cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
									>
										<FileText className="h-4 w-4 text-muted-foreground/70" />
										<span className="font-medium">References</span>
										<div className="flex items-center ml-auto">
											<div className="flex items-center justify-center border bg-background text-xs py-0.5 px-1.5 rounded">
												R
											</div>
										</div>
									</CommandItem>
									<CommandItem
										onSelect={() => {
											router.push("/integrations");
											setOpen(false);
										}}
										className="flex items-center gap-3 py-2.5 px-2 cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
									>
										<Settings className="h-4 w-4 text-muted-foreground/70" />
										<span className="font-medium">All Integrations</span>
										<div className="flex items-center ml-auto">
											<div className="flex items-center justify-center border bg-background text-xs py-0.5 px-1.5 rounded">
												I
											</div>
										</div>
									</CommandItem>
								</CommandGroup>
							</CommandList>
						</Command>
					</div>
				</DialogContent>
			</CommandDialog>
		</>
	);
}
