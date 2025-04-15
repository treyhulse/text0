"use client";

import { createDocument } from "@/actions/docs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DiscordIcon } from "@/components/ui/icons/discord";
import { GithubIcon } from "@/components/ui/icons/github";
import { GmailIcon } from "@/components/ui/icons/gmail";
import { GoogleCalendarIcon } from "@/components/ui/icons/google-calendar";
import { GoogleDocsIcon } from "@/components/ui/icons/google-docs";
import { LinearIcon } from "@/components/ui/icons/linear";
import { MsTeamsIcon } from "@/components/ui/icons/ms-teams";
import { NotionIcon } from "@/components/ui/icons/notion";
import { SlackIcon } from "@/components/ui/icons/slack";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import {
  Check,
  ChevronDown,
  FileText,
  FolderOpen,
  LayoutGrid,
  Plus,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as React from "react";
import { toast } from "sonner";
import { CommandMenu } from "./command-menu";
import { Input } from "./ui/input";

interface Document {
  id: string;
  name: string;
  content?: string;
  createdAt?: string;
  userId: string;
}

export function MinimalIntegrationSidebar({ documents = [] as Document[] }) {
  const user = useUser();
  const router = useRouter();
  const [isCreatingDoc, setIsCreatingDoc] = useState(false);
  const [newDocName, setNewDocName] = useState("");
  const [state, formAction, isPending] = React.useActionState(
    createDocument,
    undefined
  );

  useEffect(() => {
    if (state?.success && state.data?.documentId) {
      toast.success("Document created successfully");
      router.push(`/docs/${state.data.documentId}`);
      setIsCreatingDoc(false);
      setNewDocName("");
    } else if (!state?.success && state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

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
    <TooltipProvider delayDuration={0}>
      <Sidebar
        collapsible="icon"
        className="bg-background text-foreground border-r border-border transition-all duration-300 ease-in-out relative flex flex-col"
      >
        {/* Header with User Name */}
        <SidebarHeader className="px-3 py-2 flex-none">
          <div className="flex items-center gap-2">
            <SignedOut>
              <div className="flex gap-2 group-data-[collapsible=icon]:hidden">
                <SignInButton />
                <SignUpButton />
              </div>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
            {user.user && (
              <span className="text-xs font-medium truncate group-data-[collapsible=icon]:hidden">
                {user.user.fullName}
              </span>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="flex-1">
          {/* Command Menu */}
          <SidebarGroup>
            <div className="relative w-full">
              <div className="group-data-[collapsible=icon]:hidden w-full">
                <CommandMenu
                  documents={documents}
                  onCreateDocument={() => {
                    const newDocButton = document.querySelector(
                      "[data-new-doc-trigger]"
                    );
                    if (newDocButton instanceof HTMLElement) {
                      newDocButton.click();
                    }
                  }}
                />
              </div>
              <div className="hidden group-data-[collapsible=icon]:block">
                <CommandMenu
                  documents={documents}
                  onCreateDocument={() => {
                    const newDocButton = document.querySelector(
                      "[data-new-doc-trigger]"
                    );
                    if (newDocButton instanceof HTMLElement) {
                      newDocButton.click();
                    }
                  }}
                  variant="icon"
                />
              </div>
            </div>
          </SidebarGroup>

          {/* Main Navigation */}
          <SidebarGroup className="flex-1">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Home"
                  className="w-full flex items-center justify-start gap-2 group-data-[collapsible=icon]:justify-center py-1.5 px-2 text-sm"
                >
                  <Link
                    href="/"
                    className="w-full flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
                  >
                    <LayoutGrid className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate group-data-[collapsible=icon]:hidden">
                      Home
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Documents Section */}
              <SidebarMenuItem>
                <Collapsible defaultOpen={true} className="w-full">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip="My Documents"
                      className="w-full flex items-center gap-2 group-data-[collapsible=icon]:justify-center py-1.5 px-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate font-medium tracking-wide group-data-[collapsible=icon]:hidden">
                        My Documents
                      </span>
                      <ChevronDown className="ml-auto h-4 w-4 shrink-0 transition-transform group-data-[state=open]/collapsible:rotate-180 group-data-[collapsible=icon]:hidden" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="space-y-1 py-1">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="px-2 ml-4 border-l border-dashed border-border group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:ml-0"
                        >
                          <SidebarMenuButton
                            asChild
                            tooltip={doc.name}
                            className="flex w-full items-center gap-2 rounded-lg py-1.5 px-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground group-data-[collapsible=icon]:justify-center"
                          >
                            <Link href={`/docs/${doc.id}`}>
                              <FileText className="h-4 w-4 shrink-0" />
                              <span className="truncate group-data-[collapsible=icon]:hidden">
                                {doc.name}
                              </span>
                            </Link>
                          </SidebarMenuButton>
                        </div>
                      ))}
                      <div className="px-1 group-data-[collapsible=icon]:px-0">
                        {isCreatingDoc ? (
                          <form
                            action={formAction}
                            className="flex items-center gap-1 group-data-[collapsible=icon]:hidden"
                          >
                            <Input
                              name="name"
                              placeholder="Document name"
                              value={newDocName}
                              onChange={(e) => setNewDocName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Escape") {
                                  e.preventDefault();
                                  setIsCreatingDoc(false);
                                  setNewDocName("");
                                }
                              }}
                              className="h-9 text-sm dark:bg-muted"
                              autoFocus
                              disabled={isPending}
                            />
                            <div className="flex gap-1">
                              <SidebarMenuButton
                                type="submit"
                                size="sm"
                                tooltip="Create document"
                                className="h-8 w-8"
                                disabled={isPending || !newDocName.trim()}
                              >
                                {isPending ? (
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </SidebarMenuButton>
                              <SidebarMenuButton
                                type="button"
                                size="sm"
                                tooltip="Cancel"
                                className="h-8 w-8"
                                onClick={() => {
                                  setIsCreatingDoc(false);
                                  setNewDocName("");
                                }}
                                disabled={isPending}
                              >
                                <X className="h-4 w-4" />
                              </SidebarMenuButton>
                            </div>
                          </form>
                        ) : (
                          <SidebarMenuButton
                            variant="outline"
                            size="sm"
                            tooltip="New Document"
                            className="w-full h-9 dark:bg-muted group-data-[collapsible=icon]:size-8 flex items-center justify-start gap-2 pl-2 border border-dashed border-foreground/20 text-sm group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:pl-0 group-data-[collapsible=icon]:pr-0"
                            onClick={() => setIsCreatingDoc(true)}
                          >
                            <Plus className="h-4 w-4 shrink-0" />
                            <span className="group-data-[collapsible=icon]:hidden">
                              New Document
                            </span>
                          </SidebarMenuButton>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Collapsible defaultOpen={false} className="w-full">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip="Integrations"
                      className="w-full flex items-center gap-2 group-data-[collapsible=icon]:justify-center py-1.5 px-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Settings className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate font-medium tracking-wide group-data-[collapsible=icon]:hidden">
                        Integrations
                      </span>
                      <ChevronDown className="ml-auto h-4 w-4 shrink-0 transition-transform group-data-[state=open]/collapsible:rotate-180 group-data-[collapsible=icon]:hidden" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="space-y-1 py-1">
                      {integrations.map((integration) => (
                        <div
                          key={integration.name}
                          className={cn("px-1", {
                            "opacity-50 cursor-not-allowed":
                              integration.disabled,
                          })}
                        >
                          {!integration.disabled && (
                            <SidebarMenuButton
                              asChild
                              tooltip={integration.name}
                              className="flex w-full items-center gap-2 rounded-lg py-1.5 px-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground group-data-[collapsible=icon]:justify-center"
                            >
                              <Link href={integration.link}>
                                <integration.icon className="h-4 w-4 shrink-0" />
                                <span className="truncate group-data-[collapsible=icon]:hidden">
                                  {integration.name}
                                </span>
                              </Link>
                            </SidebarMenuButton>
                          )}
                        </div>
                      ))}
                      <div className="px-1">
                        <SidebarMenuButton
                          asChild
                          tooltip="View all integrations"
                          className="flex w-full items-center gap-2 rounded-lg py-1.5 px-2 text-sm font-medium text-primary hover:bg-muted group-data-[collapsible=icon]:justify-center"
                        >
                          <Link href="/integrations">
                            <span className="truncate group-data-[collapsible=icon]:hidden">
                              View all integrations
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  );
}
