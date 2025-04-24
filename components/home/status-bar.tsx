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
		<footer className="w-full border-border/40 border-t bg-background">
			<div className="flex h-8 w-full items-center justify-between px-4">
				<div className="flex items-center gap-4 text-muted-foreground text-xs">
					<span>{referencesCount} references</span>
					<span>{documentsCount} documents</span>
				</div>
				<div className="text-muted-foreground text-xs">{userName} • kcsf note</div>
			</div>
		</footer>
	);
}
