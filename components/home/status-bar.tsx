interface StatusBarProps {
	documentsCount: number;
	referencesCount: number;
	userName: string | null;
}

export function StatusBar({
	documentsCount,
	referencesCount,
	userName,
}: StatusBarProps) {
	return (
		<footer className="border-border/40 w-full border-t bg-background">
			<div className="w-full flex h-8 items-center justify-between px-4">
				<div className="flex items-center gap-4 text-muted-foreground text-xs">
					<span>{referencesCount} references</span>
					<span>{documentsCount} documents</span>
				</div>
				<div className="text-muted-foreground text-xs">{userName} • text0</div>
			</div>
		</footer>
	);
}
