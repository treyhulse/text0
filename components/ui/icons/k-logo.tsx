import Image from "next/image";
import type React from "react";
import { cn } from "@/lib/utils";

type KLogoProps = {
	width?: number;
	height?: number;
	className?: string;
	inverted?: boolean;
};

export const KLogo: React.FC<KLogoProps> = ({
	width = 32,
	height = 32,
	className,
	inverted = false,
}) => (
	<div className={className} style={{ width, height }}>
		<Image
			src="/k-logo.png"
			alt="KC Store Fixtures Logo"
			width={width}
			height={height}
			className={cn(
				"object-contain",
				inverted && "brightness-0 invert"
			)}
			priority
		/>
	</div>
);

export const InvertedKLogo = (props: KLogoProps) => (
	<KLogo {...props} inverted={true} />
); 