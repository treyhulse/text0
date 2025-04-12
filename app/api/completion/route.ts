import { vector } from "@/lib/vector";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const body = await req.json();

  const context = await vector.query({
    data: body.prompt,
    topK: 5,
    includeData: true,
  });

  const contextData = context.map((c) => c.data).join("\n");

  console.log("contextData", contextData);

  const result = streamText({
    model: openai("gpt-4o-mini"),
    prompt: `
      <task>
      You are an autocompletion system that suggests text completions.
      
      Rules:
      - USE the provided context in <context> tags
      - Read CAREFULLY the input text in <input> tags
      - Suggest up to 8 words maximum
      - Ensure suggestions maintain semantic meaning
      - Wrap completion in <completion> tags
      - Return only the completion text
      - Periods at the end are optional
      </task>
      
      <example>
      <context>Math Academy is a challenging but rewarding platform for learning math.</context>
      <input>Math Academy teaches</input>
      <completion> math in a fun and engaging way.</completion>
      </example>

      <context>
      ${contextData}
      </context>
      <input>
      ${body.prompt}
      </input>

      Your completion:
    `,
    temperature: 0.75,
    maxTokens: 30,
  });

  return result.toDataStreamResponse();
}
