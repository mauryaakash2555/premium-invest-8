import { streamText } from 'ai';
import { xai } from '@ai-sdk/xai';

export const POST = async (req) => {
  const { messages } = await req.json();

  const result = await streamText({
    model: xai('grok-beta'),
    messages,
  });

  return result.toDataStreamResponse();
};
