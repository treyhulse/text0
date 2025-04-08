import { Button } from "@/components/ui/button";

export default function Home() {
	return (
		<main className="min-h-screen bg-white dark:bg-black">
			{/* Hero Section */}
			<div className="container mx-auto px-4 py-24">
				<div className="flex flex-col items-center text-center space-y-8">
					<h1 className="text-5xl font-bold tracking-tight">text0</h1>
					<p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
						Your AI-native writing assistant that writes with you, not after
						you.
					</p>
					<div className="flex gap-4">
						<Button
							type="button"
							className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-90 transition-opacity"
						>
							Get Started
						</Button>
						<Button
							type="button"
							className="px-6 py-2 border border-gray-200 dark:border-gray-800 rounded-md hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
						>
							View Demo
						</Button>
					</div>
				</div>
			</div>

			{/* Features Section */}
			<div className="container mx-auto px-4 py-24">
				<h2 className="text-3xl font-semibold text-center mb-16">
					Key Features
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{[
						{
							title: "Context Injection on the Fly",
							description:
								"Drag and drop PDFs, docs, or Slack messages to instantly train the AI with your context.",
						},
						{
							title: "Real-time Tone Shifter",
							description:
								"Adjust your text's tone from casual to formal with a simple slider while you write.",
						},
						{
							title: "Rewrite-by-Example",
							description:
								"Paste a snippet from your favorite writer and text0 rewrites your text in that style.",
						},
						{
							title: "Snippets & Templates",
							description:
								"Use quick commands like /intro or /outline to insert structured blocks.",
						},
						{
							title: "Semantic Highlight",
							description:
								"Hover over any sentence to see grammar, sentiment, and complexity analysis.",
						},
						{
							title: "Smart Collaboration",
							description:
								"Multiple users can edit in real-time while text0 adapts to each person's tone.",
						},
					].map((feature) => (
						<div
							key={feature.title}
							className="p-6 rounded-lg border border-gray-100 dark:border-gray-800"
						>
							<h3 className="text-lg font-medium mb-3">{feature.title}</h3>
							<p className="text-gray-600 dark:text-gray-400">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</div>

			{/* CTA Section */}
			<div className="container mx-auto px-4 py-24">
				<div className="max-w-2xl mx-auto text-center space-y-8">
					<h2 className="text-3xl font-semibold">
						Ready to Transform Your Writing?
					</h2>
					<p className="text-lg text-gray-600 dark:text-gray-400">
						Join thousands of writers who are already using text0 to write
						better content, faster.
					</p>
					<Button
						type="button"
						className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-md hover:opacity-90 transition-opacity"
					>
						Start Writing with text0
					</Button>
				</div>
			</div>
		</main>
	);
}
