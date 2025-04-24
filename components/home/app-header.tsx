import { KLogo } from "@/components/ui/icons/k-logo";
import { TextScramble } from "../text-scramble";

export function AppHeader() {
	return (
		<div className="mb-8 flex items-start justify-start gap-4">
			<div className="rounded-lg bg-foreground p-3">
				<KLogo className="h-8 w-8 text-primary" />
			</div>
			<div className="flex flex-col gap-1">
				<TextScramble
					as="h1"
					className="p-0 font-semibold text-2xl lowercase tracking-tight"
					characterSet={["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
					animateOnHover={false}
				>
					kcsf note
				</TextScramble>
				<p className="text-muted-foreground text-sm">
					Your documents and memories in one place
				</p>
			</div>
		</div>
	);
}
