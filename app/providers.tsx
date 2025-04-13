"use client";
import { ThemeProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { SidebarProvider } from "@/components/ui/sidebar";

export const Providers = ({ children }: { children: React.ReactNode }) => {
	return (
		<NuqsAdapter>
			<ClerkProvider>
				<ThemeProvider
					attribute="class"
					disableTransitionOnChange
					defaultTheme="system"
				>
					<SidebarProvider defaultOpen={true}>{children}</SidebarProvider>
				</ThemeProvider>
			</ClerkProvider>
		</NuqsAdapter>
	);
};
