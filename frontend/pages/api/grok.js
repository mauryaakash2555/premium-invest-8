import { streamText } from 'ai';
import { xai } from '@ai-sdk/xai';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { messages } = await req.json();

  const result = await streamText({
    model: xai('grok-beta'),
    messages,
    maxTokens: 512,
    temperature: 0.7,
  });

  return result.toDataStreamResponse();
}
