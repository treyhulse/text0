import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import { TourProvider } from "@/components/tour";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "kcsf Note – AI-Powered Note Taking Interface",
	description:
		"kcsf Note is your intelligent note-taking companion. Streamline your workflow with AI-powered assistance, smart organization, and seamless integration. Built for KC Store Fixtures team members to enhance productivity and collaboration.",
	keywords: [
		"kcsf Note",
		"kcsf",
		"AI note taking",
		"Business notes",
		"Team collaboration",
		"Smart notes",
		"AI-powered notes",
		"Productivity tools",
		"Business documentation",
		"Team workspace",
		"Digital notes",
		"Smart organization",
		"Enterprise notes",
		"Retail management",
		"Store fixtures"
	],
	applicationName: "kcsf Note",
	authors: [
		{
			name: "KC Store Fixtures",
			url: "https://www.kcstore.com",
		}
	],
	creator: "kcsf",
	publisher: "kcsf",
	metadataBase: new URL("https://notes.kcstore.com"),
	openGraph: {
		type: "website",
		title: "kcsf Note – AI-Powered Note Taking Interface",
		description:
			"Transform your note-taking experience with kcsf Note. Intelligent organization, AI assistance, and seamless team collaboration for kcsf.",
		url: "https://notes.kcstore.com",
		images: [
			{
				url: "/og.png",
				width: 1200,
				height: 630,
				alt: "kcsf Note – kcsf's AI-Powered Note Taking Interface",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "kcsf Note – Smart Note Taking for kcsf",
		description:
			"Experience intelligent note-taking with AI assistance. Built specifically for kcsf team members to enhance productivity and collaboration.",
		creator: "@treyhulse",
		images: ["/og.png"],
	},
	themeColor: "#000000",
	icons: {
		icon: "/favicon.ico",
		apple: "/apple-touch-icon.png",
	},
	category: "productivity",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
			>
				<Providers>
					<TourProvider>{children}</TourProvider>
					<Toaster />
				</Providers>
				<Analytics />
			</body>
		</html>
	);
}
