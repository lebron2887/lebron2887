import OpenAI from 'openai';
import { UserTier, TIER_LIMITS } from './utils';

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

export async function* streamChat(
  messages: Message[],
  tier: UserTier,
  images: string[] = []
) {
  const tierConfig = TIER_LIMITS[tier];
  
  // Build message with images
  const lastMessage = messages[messages.length - 1];
  if (lastMessage && images.length > 0) {
    const content: any[] = [
      { type: 'text', text: typeof lastMessage.content === 'string' ? lastMessage.content : '' }
    ];
    
    images.forEach(imageData => {
      content.push({
        type: 'image_url',
        image_url: { url: `data:image/jpeg;base64,${imageData}` }
      });
    });
    
    messages[messages.length - 1] = { ...lastMessage, content };
  }

  const params: any = {
    model: tierConfig.model,
    messages,
    stream: true,
  };

  // Add extended thinking for Max tier
  if (tier === 'max') {
    params.thinking = {
      type: 'enabled',
      budget_tokens: 10000,
    };
  }

  const stream = await client.chat.completions.create(params);

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      yield content;
    }
  }
}

export async function generateImage(prompt: string): Promise<string> {
  const response = await client.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1024x1024',
  });

  return response.data[0]?.url || '';
}

export async function transcribeAudio(audioFile: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', audioFile);
  formData.append('model', 'whisper-1');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    },
    body: formData,
  } );

  if (!response.ok) {
    throw new Error('Transcription failed');
  }

  const data = await response.json();
  return data.text;
}
