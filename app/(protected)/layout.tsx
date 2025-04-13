import { MinimalIntegrationSidebar } from "@/components/integration-sidebar";

export default function ProtectedLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<div className="flex w-full h-screen">
			<MinimalIntegrationSidebar />
			<main
				className="flex-1
              w-full
               overflow-auto"
			>
				{children}
			</main>
		</div>
	);
}
