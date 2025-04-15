"use client";

import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from "@/components/ui/sidebar";

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
					<kbd className="text-foreground inline-flex h-5 max-h-full items-center rounded border bg-muted px-1 font-mono text-[0.625rem] font-medium ml-2">
						⌘O
					</kbd>
				</Button>
			</TooltipTrigger>
			<TooltipContent>Toggle AI Assistant</TooltipContent>
		</Tooltip>
	);
}
