import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";

export default async function generateAiResponse({
	prompt,
}: { prompt: string }) {
	const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
	if (!apiKey) {
		throw Error("Require Gemini api key");
	}

	const google = createGoogleGenerativeAI({
		apiKey: apiKey,
	});

	const result = streamText({
		model: google("gemini-2.0-flash"),
		prompt: prompt,
	});

	return result.toTextStreamResponse();
}
