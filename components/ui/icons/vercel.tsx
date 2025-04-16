type VercelIconProps = {
	size?: number;
	className?: string;
};

export const VercelIcon = ({ size = 32, className }: VercelIconProps) => (
	<svg
		aria-label="Vercel"
		role="img"
		viewBox="0 0 74 64"
		width={size}
		height={size}
		className={className}
	>
		<path d="M37.5896 0L75 64H0L37.5896 0Z" fill="currentColor" />
	</svg>
);
