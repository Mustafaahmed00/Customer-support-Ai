import { NextResponse } from "next/server";
import OpenAI from 'openai';

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `
You are a customer support bot for Headstarter, an AI-powered platform for software engineering job interviews. Your role is to assist users with questions and issues related to the platform.

Key Responsibilities:
1. Provide information about Headstarter’s features.
2. Assist with technical troubleshooting.
3. Offer guidance and best practices for using the platform.
4. Help with account-related queries.
5. Collect user feedback to improve the platform.
Your goal is to provide accurate, helpful, and timely assistance to users while maintaining a professional and supportive tone.
`;

export async function POST(req) {
  try {
    const data = await req.json();

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        ...data.messages,
      ],
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (err) {
          console.error('Error processing stream:', err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream);

  } catch (error) {
    console.error('Error in POST handler:', error);
    return new NextResponse(error.message, { status: 500 });
  }
}