import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function POST(req: Request) {
  const { messages, data } = await req.json();
  const lastMessage = messages[messages.length - 1];
  const userText = lastMessage.content.trim().toLowerCase();
  const hasImage = data?.image; // We'll pass base64 image data from the frontend

  // 1. Logic for "/ping"
  if (userText === '/ping') {
    return new Response(JSON.stringify({ role: 'assistant', content: 'pong!' }));
  }

  // 2 & 4. Logic for "/belfood" and Image Uploads
  if (userText === '/belfood') {
    return new Response(JSON.stringify({ role: 'assistant', content: 'Ready! Please upload a photo for identification.' }));
  }

  // If user uploads an image...
  if (hasImage) {
    // Check if the previous message was "/belfood" (Requirement 4)
    const wasBelfoodTriggered = messages.some((m: any) => m.content.toLowerCase() === '/belfood');
    
    if (!wasBelfoodTriggered) {
      return new Response(JSON.stringify({ role: 'assistant', content: 'You need to send "/belfood" first to proceed.' }));
    }

    // Process with Gemini (Requirement 2)
    const { text } = await generateText({
      model: google('gemini-1.5-flash'),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Identify what is in this image clearly and concisely.' },
            { type: 'image', image: data.image }, // Base64 string
          ],
        },
      ],
    });

    return new Response(JSON.stringify({ role: 'assistant', content: text }));
  }

  // 3. Logic for invalid inputs
  return new Response(JSON.stringify({ role: 'assistant', content: 'Input is invalid. Use /belfood or /ping.' }));
}