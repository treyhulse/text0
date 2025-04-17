import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function Loading() {
	return (
		<div className="flex h-screen justify-between">
			<div className="mt-6 px-14">
				<Skeleton className="h-6 w-48 bg-muted" />
				<Skeleton className="mt-2 h-4 w-32 bg-muted" />
				<div className="mt-4 grid grid-cols-1 gap-2">
					{Array.from({ length: 6 }).map((_, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						<Skeleton key={index} className="h-4 w-[70%] bg-muted" />
					))}
				</div>
				<div className="mt-8 grid grid-cols-1 gap-2">
					{Array.from({ length: 4 }).map((_, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						<Skeleton key={index} className="h-4 w-[70%] bg-muted" />
					))}
				</div>
			</div>
			<div className="flex flex-col w-72 border-l">
				<div className="flex w-full items-center justify-between border-b p-4">
					<Skeleton className="h-4 w-32 bg-muted" />
					<Skeleton className="size-4 bg-muted" />
				</div>
				<div className="m-2 grid grid-cols-1 rounded-lg border">
					<Skeleton className="h-4 h-8 w-32 w-full rounded-none bg-muted" />
					<div className="grid grid-cols-1">
						{Array.from({ length: 4 }).map((_, index) => (
							<div // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
								key={index}
								className={cn(
									"flex h-12 items-center gap-2 px-2",
									index !== 3 && "border-b",
								)}
							>
								<Skeleton className="size-4 bg-muted" />
								<Skeleton className="h-6 w-32 bg-muted" />
							</div>
						))}
					</div>
				</div>
				<div className="mt-8 grow border-t" />
				<div className="border-t p-2">
					<Skeleton className="h-12 w-full bg-muted" />
				</div>
			</div>
		</div>
	);
}
