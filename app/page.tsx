"use client";

import Keyboard from "@/components/t0-keyboard";
import { TextScramble } from "@/components/text-scramble";
import { GithubIcon } from "@/components/ui/icons/github";
import { VercelIcon } from "@/components/ui/icons/vercel";
import { XIcon } from "@/components/ui/icons/x-icon";
import { motion, useAnimation } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LandingPage() {
	const arrowControls = useAnimation();
	const [hasPressed, setHasPressed] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const router = useRouter();

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);

		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	useEffect(() => {
		arrowControls.start({
			pathLength: [0, 1],
			opacity: [0, 1],
			transition: {
				duration: 1.5,
				ease: "easeInOut",
				repeat: Number.POSITIVE_INFINITY,
				repeatType: "loop",
				repeatDelay: 0.5,
			},
		});

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key.toLowerCase() === "t") {
				setHasPressed(true);
				router.push("/home");
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [arrowControls, router]);

	return (
		<div className="relative flex h-screen flex-col overflow-hidden bg-background text-foreground">
			{/* Gradient Background Effects */}
			<div className="pointer-events-none absolute inset-0 z-0">
				{/* Primary gradient */}
				<div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-transparent" />
				{/* Accent gradients */}
				<div className="-left-1/4 absolute top-0 h-[500px] w-[500px] rounded-full bg-primary/5 opacity-50 blur-[100px]" />
				<div className="-right-1/4 absolute bottom-0 h-[500px] w-[500px] rounded-full bg-primary/5 opacity-50 blur-[100px]" />
			</div>

			{/* Main Content */}
			<main className="relative z-10 flex h-full flex-1 items-center justify-center overflow-auto">
				<div className="container mx-auto my-auto flex h-full max-w-2xl flex-col items-center justify-center">
					{/* Hackathon Badge */}
					<div className="mb-8 flex items-center gap-2 rounded-full border border-border/50 bg-background/50 px-3 py-1.5 backdrop-blur-sm">
						<VercelIcon size={16} className="text-foreground" />
						<span className="text-muted-foreground text-sm">
							Built for Vercel Hackathon
						</span>
					</div>

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
								text0
							</TextScramble>
							<p className="font-mono text-base text-muted-foreground uppercase">
								Your AI-native personal text editor
							</p>
						</div>
					</div>

					{/* Press T to Start Prompt */}
					<motion.div
						className="mb-8 text-center"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: hasPressed ? 0 : 1, y: hasPressed ? -20 : 0 }}
						transition={{ duration: 0.5 }}
					>
						<p className="text-lg text-muted-foreground">
							{isMobile ? (
								"Press the button to get started"
							) : (
								<>
									Press{" "}
									<kbd className="inline-flex size-5 max-h-full items-center justify-center rounded border bg-muted px-1 font-medium font-mono text-[0.625rem] text-foreground">
										T
									</kbd>{" "}
									to get started
								</>
							)}
						</p>
					</motion.div>

					{/* Keyboard */}
					<div className="size-40">
						<Keyboard />
					</div>
				</div>
			</main>

			{/* Status Bar */}
			<footer className="relative z-10 border-border/40 border-t bg-background/80 backdrop-blur-sm">
				<div className="container mx-auto flex h-8 max-w-2xl items-center justify-between px-4">
					<div className="flex items-center gap-4 text-muted-foreground text-xs">
						<a
							href="https://github.com/crafter-station/text0"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-foreground"
						>
							<GithubIcon className="h-3.5 w-3.5" />
						</a>
						<a
							href="https://twitter.com/raillyhugo"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-foreground"
						>
							<XIcon className="h-3.5 w-3.5" />
						</a>
					</div>
					<div className="text-muted-foreground text-xs">
						text0 • Built by{" "}
						<a
							href="https://github.com/Railly"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-foreground"
						>
							Railly Hugo
						</a>{" "}
						&{" "}
						<a
							href="https://cueva.io"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-foreground"
						>
							Anthony Cueva
						</a>
					</div>
				</div>
			</footer>
		</div>
	);
}
