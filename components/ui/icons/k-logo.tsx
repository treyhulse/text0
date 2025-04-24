import Image from "next/image";
import type React from "react";

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
			src={inverted ? "/k-logo-light.png" : "/k-logo.png"}
			alt="KC Store Fixtures Logo"
			width={width}
			height={height}
			className="object-contain"
			priority
		/>
	</div>
);

export const InvertedKLogo = (props: KLogoProps) => (
	<KLogo {...props} inverted={true} />
); 