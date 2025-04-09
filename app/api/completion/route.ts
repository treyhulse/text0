import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    prompt: `
    <context>
    ${bob}
    </context>
   
    <task>
    You are an autocompletion system that suggests the next couple of words in a sentence. 
    Use the context wrapped in <context> tags to suggest
    the next couple of words in the sentence. The sentence is wrapped in <sentence> tag. It 
    is important to suggest a maximum of 5 words. The words following the last words have to
    has the semantic meaning of the sentence.
    </task>
    <examples>
    <example>
    <sentence>Margarita is a</sentence>
    <completion>computer scientist</completion>
    </example>
    <example>
    <sentence>The solar system is</sentence>
    <completion>made up of planets</completion>
    </example>
    </examples>

    <sentence>${prompt}</sentence>
    `,
  });

  return result.toDataStreamResponse();
}

const bob = `
My Math Academy Learning Workflow
Aug 25, 2024 • 5 min read

Navigating complex Math Academy lessons can be challenging. Over time, I’ve developed a structured approach that has significantly improved my understanding and retention of mathematical concepts. Let me walk you through my process, and hopefully it’ll speed up your learning journey.
Here’s how I approach each new Math Academy lesson:

Topic Check: I start by asking, “Is this a new topic?”

For new topics, I use an AI tool to generate initial notes.
For familiar topics, I review my existing notes.
Quick Prep: I spend about 5 minutes reviewing the notes. This brief overview helps prime my brain for the lesson.

Math Academy Lesson: With this preparation, I find it easier to follow and engage with the actual lesson.

Note Refinement: After the lesson, I revisit my notes. I add new information, clarify points, and sometimes correct misunderstandings.

Practice Problems: Next, I tackle practice problems. When I make mistakes, I try to figure them out on my own before checking the solutions.

Repeat: I move on to the next topic and start the process again.

`;
