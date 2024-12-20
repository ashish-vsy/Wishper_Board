import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

    // Make a streaming completion request
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Ensure you're using a model that supports chat completions
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });

    // Create a readable stream from the response
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          // Each chunk contains the message content
          if (chunk.choices) {
            for (const choice of chunk.choices) {
              // Ensure choice.message.content is available
              if (choice.delta && choice.delta.content) {
                controller.enqueue(new TextEncoder().encode(choice.delta.content));
              }
            }
          }
        }
        controller.close();
      },
    });

    // Return the stream as a response
    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      // OpenAI API error handling
      const { name, status, headers, message } = error;
      return NextResponse.json({ name, status, headers, message }, { status });
    } else {
      // General error handling
      console.error('An unexpected error occurred:', error);
      throw error;
    }
  }
}
