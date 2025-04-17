"use client";

import { QuickActionButton } from "@/components/home/quick-action-button";
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
import { FileText, LayoutGrid, Plus, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Document {
	id: string;
	name: string;
	content?: string;
	createdAt?: string;
}

interface SearchCommandProps {
	documents: Document[];
}

export function SearchCommand({ documents }: SearchCommandProps) {
	const [open, setOpen] = useState(false);
	const router = useRouter();

	const handleCreateDocument = () => {
		const newDocButton = document.querySelector("[data-new-doc-trigger]");
		if (newDocButton instanceof HTMLElement) {
			newDocButton.click();
		}
		setOpen(false);
	};

	return (
		<>
			<QuickActionButton
				iconName="Search"
				label="Search"
				onClick={() => setOpen(true)}
			/>

			<CommandDialog open={open} onOpenChange={setOpen}>
				<DialogContent
					className="!rounded-xl max-w-[640px] overflow-hidden border p-0 shadow-[0px_1px_1px_rgba(0,0,0,0.02),_0px_8px_16px_-4px_rgba(0,0,0,0.04),_0px_24px_32px_-8px_rgba(0,0,0,0.06)]"
					title="Command Menu"
				>
					<div className="relative flex flex-col overflow-hidden">
						<Command className="border-0">
							<CommandInput
								placeholder="What do you need?"
								className="h-12 border-0 text-lg placeholder:text-muted-foreground/50 focus:ring-0"
							/>

							<CommandList className="min-h-[400px] overflow-y-auto">
								<CommandEmpty className="py-6 text-center text-muted-foreground text-sm">
									No results found.
								</CommandEmpty>

								<CommandGroup
									heading="Documents"
									className="px-2 py-1.5 font-medium text-muted-foreground text-sm [&_[cmdk-group-heading]]:py-2.5 [&_[cmdk-group-heading]]:font-normal [&_[cmdk-group-heading]]:text-[13px] [&_[cmdk-group-heading]]:text-muted-foreground/70"
								>
									<CommandItem
										onSelect={handleCreateDocument}
										className="flex cursor-pointer items-center gap-3 px-2 py-2.5 aria-selected:bg-accent aria-selected:text-accent-foreground"
									>
										<Plus className="h-4 w-4 text-muted-foreground/70" />
										<span className="font-medium">Create New Document</span>
									</CommandItem>

									{documents.map((doc) => (
										<CommandItem
											key={doc.id}
											onSelect={() => {
												router.push(`/docs/${doc.id}`);
												setOpen(false);
											}}
											className="flex cursor-pointer items-center gap-3 px-2 py-2.5 aria-selected:bg-accent aria-selected:text-accent-foreground"
										>
											<FileText className="h-4 w-4 text-muted-foreground/70" />
											<span className="font-medium">{doc.name}</span>
										</CommandItem>
									))}
								</CommandGroup>

								<CommandSeparator />

								<CommandGroup
									heading="Navigation"
									className="px-2 py-1.5 font-medium text-muted-foreground text-sm [&_[cmdk-group-heading]]:py-2.5 [&_[cmdk-group-heading]]:font-normal [&_[cmdk-group-heading]]:text-[13px] [&_[cmdk-group-heading]]:text-muted-foreground/70"
								>
									<CommandItem
										onSelect={() => {
											router.push("/");
											setOpen(false);
										}}
										className="flex cursor-pointer items-center gap-3 px-2 py-2.5 aria-selected:bg-accent aria-selected:text-accent-foreground"
									>
										<LayoutGrid className="h-4 w-4 text-muted-foreground/70" />
										<span className="font-medium">Home</span>
									</CommandItem>
									<CommandItem
										onSelect={() => {
											router.push("/references");
											setOpen(false);
										}}
										className="flex cursor-pointer items-center gap-3 px-2 py-2.5 aria-selected:bg-accent aria-selected:text-accent-foreground"
									>
										<FileText className="h-4 w-4 text-muted-foreground/70" />
										<span className="font-medium">References</span>
									</CommandItem>
									<CommandItem
										onSelect={() => {
											router.push("/integrations");
											setOpen(false);
										}}
										className="flex cursor-pointer items-center gap-3 px-2 py-2.5 aria-selected:bg-accent aria-selected:text-accent-foreground"
									>
										<Settings className="h-4 w-4 text-muted-foreground/70" />
										<span className="font-medium">All Integrations</span>
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
