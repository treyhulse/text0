"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { MessageSquare } from "lucide-react";

export function AIChatTrigger() {
	const { toggleSidebar } = useSidebar();

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="flex items-center gap-2"
					onClick={toggleSidebar}
				>
					<MessageSquare className="h-4 w-4" />
					<span>AI Chat</span>
					<kbd className="ml-2 inline-flex h-5 max-h-full items-center rounded border bg-muted px-1 font-medium font-mono text-[0.625rem] text-foreground">
						⌘O
					</kbd>
				</Button>
			</TooltipTrigger>
			<TooltipContent>Toggle AI Assistant</TooltipContent>
		</Tooltip>
	);
}
