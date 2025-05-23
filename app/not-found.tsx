import { ArrowLeft, Ship, Timer } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
	return (
		<div className="container relative mx-auto flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4">
			{/* Floating gradients */}
			<div
				className="pointer-events-none absolute top-1/3 left-1/4 h-[500px] w-[500px] animate-float"
				style={{
					background:
						"radial-gradient(circle at center, hsl(var(--primary)) 0%, transparent 70%)",
					opacity: 0.15,
					filter: "blur(80px)",
				}}
			/>
			<div
				className="pointer-events-none absolute top-1/2 right-1/4 h-[400px] w-[400px] animate-float-slow"
				style={{
					background:
						"radial-gradient(circle at center, hsl(var(--secondary)) 0%, transparent 70%)",
					opacity: 0.1,
					filter: "blur(60px)",
				}}
			/>

			{/* Content */}
			<div className="relative z-10 max-w-lg text-center">
				{/* Fun 404 animation */}
				<div className="mb-8 flex items-center justify-center gap-4">
					<div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/50 bg-card">
						<span className="animate-bounce font-semibold text-2xl text-primary">
							4
						</span>
					</div>
					<div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/50 bg-card">
						<Ship className="h-8 w-8 animate-float text-primary" />
					</div>
					<div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/50 bg-card">
						<span className="animate-bounce font-semibold text-2xl text-primary">
							4
						</span>
					</div>
				</div>

				<div className="group mb-12 rounded-xl border border-border/50 bg-card p-6 transition-all hover:scale-[1.02] hover:border-primary/20 hover:bg-card/80">
					<p className="font-medium text-xl">
						If you designed your 404 page,{" "}
						<span className="relative inline-block text-primary">
							you shipped too late
							<span className="-right-6 -top-2 absolute animate-pulse text-base">
								✨
							</span>
						</span>
					</p>
					<p className="mt-2 text-muted-foreground text-sm">
						— Guillermo Rauch
					</p>
				</div>

				<div className="flex items-center justify-center gap-4">
					<Link
						href="/"
						className="hover:-translate-y-0.5 inline-flex items-center gap-2 rounded-lg border border-border/50 bg-card px-4 py-2 text-sm transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to shipping
					</Link>
					<div className="flex items-center gap-2 text-muted-foreground text-sm">
						<Timer className="h-4 w-4 animate-spin-slow" />
						Time to ship something else
					</div>
				</div>
			</div>
		</div>
	);
}
