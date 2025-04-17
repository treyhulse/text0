// components/QuickActionButton.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, icons } from "lucide-react"; // Import icons dynamically
import { useState } from "react";

interface QuickActionButtonProps {
	iconName: keyof typeof icons; // Icon name as string (e.g., "FileText")
	label: string;
	onClick?: () => void;
	variant?: "default" | "primary" | "secondary";
	size?: "sm" | "md" | "lg";
	disabled?: boolean;
	loading?: boolean;
	className?: string;
}

export function QuickActionButton({
	iconName,
	label,
	onClick,
	variant = "default",
	size = "md",
	disabled = false,
	loading = false,
	className,
}: QuickActionButtonProps) {
	const [isHovered, setIsHovered] = useState(false);

	// Dynamically resolve the icon component
	const Icon = icons[iconName] || Loader2; // Fallback to Loader2 if icon not found

	// Size variants
	const sizeStyles = {
		sm: "h-[60px] px-4 gap-2 text-xs",
		md: "h-[80px] px-6 gap-3 text-sm",
		lg: "h-[100px] px-8 gap-4 text-base",
	};

	// Variant styles
	const variantStyles = {
		default:
			"border-border bg-background hover:bg-muted/50 hover:border-primary/50",
		primary:
			"border-primary/20 bg-primary/10 hover:bg-primary/20 hover:border-primary",
		secondary:
			"border-secondary/20 bg-secondary/10 hover:bg-secondary/20 hover:border-secondary",
	};

	// Animation variants for the icon
	const iconVariants = {
		initial: { scale: 1, rotate: 0 },
		hover: { scale: 1.2, rotate: 5, transition: { duration: 0.2 } },
	};

	// Animation variants for the button
	const buttonVariants = {
		initial: { scale: 1, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" },
		hover: {
			scale: 1.015,
			boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
			transition: { duration: 0.2 },
		},
		tap: { scale: 0.995, transition: { duration: 0.1 } },
	};

	return (
		<motion.div
			variants={buttonVariants}
			initial="initial"
			whileHover={!disabled && !loading ? "hover" : "initial"}
			whileTap={!disabled && !loading ? "tap" : "initial"}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			className={cn(
				"relative overflow-hidden rounded-md",
				disabled && "opacity-50 cursor-not-allowed",
				className,
			)}
		>
			<Button
				variant="outline"
				onClick={onClick}
				disabled={disabled || loading}
				className={cn(
					"flex flex-col items-start justify-center w-full",
					sizeStyles[size],
					variantStyles[variant],
					"relative z-10 transition-all duration-300",
					"focus:ring-2 focus:ring-primary focus:ring-offset-2",
					"aria-disabled:opacity-50",
					!disabled &&
						!loading &&
						"hover:bg-gradient-to-br hover:from-muted/50 hover:to-transparent",
				)}
				aria-label={label}
			>
				{/* Background glow effect */}
				<AnimatePresence>
					{isHovered && !disabled && !loading && (
						<motion.div
							className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.3 }}
						/>
					)}
				</AnimatePresence>

				{/* Icon */}
				<motion.div
					variants={iconVariants}
					animate={isHovered && !disabled ? "hover" : "initial"}
				>
					{loading ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<Icon
							className={cn(
								"h-4 w-4",
								size === "lg" && "h-5 w-5",
								size === "sm" && "h-3 w-3",
							)}
						/>
					)}
				</motion.div>

				{/* Label */}
				<span className="font-medium">{label}</span>
			</Button>
		</motion.div>
	);
}
