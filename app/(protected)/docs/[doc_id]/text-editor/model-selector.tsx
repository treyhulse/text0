"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "@/components/ui/select";
import { useModel } from "@/hooks/use-model";
import { AnthropicLogo } from "@/components/ui/anthropic-logo";
import { GoogleLogo } from "@/components/ui/google-logo";
import { OpenAILogo } from "@/components/ui/openai-logo";
import { XAILogo } from "@/components/ui/xai-logo";
import { LlamaLogo } from "@/components/ui/llama-logo";

const models = [
	{
		id: "gpt-4o-mini",
		name: "GPT-4o Mini",
		description: "Fast and efficient model for quick completions",
		component: "openai",
	},
	{
		id: "grok-3-fast-beta",
		name: "Grok 3 Fast Beta",
		description: "High-speed model with balanced performance",
		component: "xai",
	},
	{
		id: "claude-3-5-sonnet-latest",
		name: "Claude 3.5 Sonnet",
		description: "Advanced model for nuanced and detailed writing",
		component: "anthropic",
	},
	{
		id: "claude-3-5-haiku-latest",
		name: "Claude 3.5 Haiku",
		description: "Lightweight model for quick and creative writing",
		component: "anthropic",
	},
	{
		id: "llama-3.1-8b-instant",
		name: "Llama 3.1 8B",
		description: "Fast and efficient model for instant completions",
		component: "llama",
	},
	{
		id: "llama-3.3-70b-versatile",
		name: "Llama 3.3 70B",
		description: "Powerful model for complex and versatile writing",
		component: "llama",
	},
	{
		id: "gemini-2.0-flash-001",
		name: "Gemini 2.0 Flash",
		description: "Quick and accurate model for fast responses",
		component: "google",
	},
	{
		id: "gemini-2.0-flash-lite-preview-02-05",
		name: "Gemini 2.0 Flash Lite",
		description: "Lightweight version for efficient completions",
		component: "google",
	},
];

function ModelLogo({ model }: Readonly<{ model: (typeof models)[0] }>) {
	const logoProps = { className: "h-5 w-5" };

	switch (model.component) {
		case "anthropic":
			return <AnthropicLogo {...logoProps} />;
		case "google":
			return <GoogleLogo {...logoProps} />;
		case "openai":
			return <OpenAILogo {...logoProps} />;
		case "xai":
			return <XAILogo {...logoProps} />;
		case "llama":
			return <LlamaLogo {...logoProps} />;
		default:
			return null;
	}
}

export function ModelSelector() {
	const [model, setModel] = useModel();
	const selectedModel = models.find((m) => m.id === model);

	return (
		<div className="w-[300px]">
			<Select
				value={model}
				onValueChange={(value: string) => setModel(value)}
				name="model-selector"
			>
				<SelectTrigger className="w-full" aria-label="Select AI model">
					<div className="flex items-center gap-2">
						{selectedModel && (
							<>
								<span aria-hidden={true}>
									<ModelLogo model={selectedModel} />
								</span>
								<span className="font-medium">{selectedModel.name}</span>
							</>
						)}
					</div>
				</SelectTrigger>
				<SelectContent>
					{models.map((model) => (
						<SelectItem
							key={model.id}
							value={model.id}
							aria-label={`${model.name} - ${model.description}`}
						>
							<div className="flex items-center gap-2">
								<span aria-hidden={true}>
									<ModelLogo model={model} />
								</span>
								<div className="flex flex-col">
									<span className="font-medium">{model.name}</span>
									<span className="text-sm text-muted-foreground">
										{model.description}
									</span>
								</div>
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
