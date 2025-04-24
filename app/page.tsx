import { AnimatedPrompt } from "@/components/animated-prompt";
import { T0Keycap } from "@/components/t0-keycap";
import { TextScramble } from "@/components/text-scramble";
import { GithubIcon } from "@/components/ui/icons/github";
import { VercelIcon } from "@/components/ui/icons/vercel";
import { XIcon } from "@/components/ui/icons/x-icon";
import Image from "next/image";

export default async function LandingPage() {
	return (
		<div className="relative flex h-screen flex-col overflow-hidden bg-background text-foreground">
			{/* Background Image */}
			<Image
				src="/bghero.webp"
				alt="Light ray background"
				width={2048}
				height={2048}
				className="pointer-events-none absolute -top-20 left-0 right-0 z-0 mx-auto hidden h-full w-full select-none md:block"
				priority
			/>

			{/* Main Content */}
			<main className="relative z-10 flex h-full flex-1 items-center justify-center overflow-auto">
				<div className="container mx-auto my-auto flex h-full max-w-2xl flex-col items-center justify-center">

					{/* App Title */}
					<div className="mb-8 flex items-center justify-center gap-4 px-4 text-center">
						<div className="flex flex-col gap-1">
							<TextScramble
								as="h1"
								className="font-semibold text-4xl lowercase tracking-tight"
								characterSet={[
									"0",
									"1",
									"2",
									"3",
									"4",
									"5",
									"6",
									"7",
									"8",
									"9",
								]}
								animateOnHover={false}
							>
								kcsf Note
							</TextScramble>
							<p className="font-mono text-base text-muted-foreground uppercase">
								Your AI-native personal text editor
							</p>
						</div>
					</div>

					{/* Press T to Start Prompt */}
					<AnimatedPrompt />

					{/* Keyboard */}
					<div className="size-40">
						<T0Keycap />
					</div>
				</div>
			</main>

			{/* Status Bar */}
			<footer className="relative z-10 border-border/40 border-t bg-background/80 backdrop-blur-sm">
				<div className="container mx-auto flex h-8 max-w-2xl items-center justify-between px-4">
					<div className="flex items-center gap-4 text-muted-foreground text-xs">
						<a
							href="/home"
							className="hover:text-foreground transition-colors"
						>
							Home
						</a>
					</div>
				</div>
			</footer>
		</div>
	);
}
