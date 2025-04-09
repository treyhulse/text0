import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
	const { blocks, currentBlock }: { blocks: string[]; currentBlock: string } =
		await req.json();

	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey) {
		throw new Error("Gemini API key is required");
	}

	const google = createGoogleGenerativeAI({ apiKey });

	const context = blocks.length
		? `${blocks.join("\n")}\n\nCurrent Block:\n${currentBlock}`
		: `Current Block:\n${currentBlock}`;

	const result = await streamText({
		model: google("models/gemini-2.0-flash"),
		prompt: `
      <context>
<article>
<title>My Math Academy Learning Workflow</title>
<date>Aug 25, 2024</date>
<readTime>5 min read</readTime>
<content>
Navigating complex Math Academy lessons can be challenging. Over time, I’ve developed a structured approach that has significantly improved my understanding and retention of mathematical concepts. Let me walk you through my process, and hopefully it’ll speed up your learning journey.
</content>
</article>
      ${context}
      </context>
      
      <task>
      You are an autocompletion system that suggests the next couple of words in a sentence. 
      Use the context wrapped in <context> tags to suggest the next couple of words in the sentence. 
      It is important to suggest a maximum of 10 words. The words following the last words have to
      have the semantic meaning of the sentence. Return the suggestion wrapped in <completion> tags.
      </task>
      
      <examples>
      <example>
      <context>My Math Academy notes.\nCurrent Block:\nMath Academy is</context>
      <completion>a challenging but rewarding platform for learning math</completion>
      </example>
      </examples>
    `,
		temperature: 0.7,
		maxTokens: 50,
	});

	return result.toDataStreamResponse();
}
