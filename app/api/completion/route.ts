import { vector } from "@/lib/vector";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const body = await req.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is required");
  }

  const google = createGoogleGenerativeAI({ apiKey });

  const context = await vector.query({
    data: body.prompt,
    topK: 5,
    includeData: true,
  });

  const contextData = context.map((c) => c.data).join("\n");

  console.log("contextData", contextData);

  const result = streamText({
    model: google("models/gemini-2.0-flash"),
    prompt: `
      <task>
      You are an autocompletion system that suggests the next couple of words in a sentence. 
      Use the context wrapped in <context> tags to suggest the next couple of words in the sentence. 
      It is important to suggest a maximum of 10 words. The words following the last words have to
      have the semantic meaning of the sentence. Return the suggestion wrapped in <completion> tags.
      Just the completion, no other text.
      </task>
      
      <example>
      <context>Math Academy is a challenging but rewarding platform for learning math.</context>
      <input>Math Academy teaches</input>
      <completion>math in a fun and engaging way.</completion>
      </example>

      <context>
      ${contextData}
      </context>
      <input>
      ${body.prompt}
      </input>

      Your completion:
    `,
    temperature: 0.7,
    maxTokens: 50,
  });

  return result.toDataStreamResponse();
}
