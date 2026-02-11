import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const message = formData.get("message") as string | null;
  const image = formData.get("image") as File | null;
  const commandStarted = formData.get("commandStarted") === "true";

  // /ping
  if (message === "/ping") {
    return NextResponse.json({ reply: "pong!" });
  }

  // If image uploaded before /belfood
  if (image && !commandStarted) {
    return NextResponse.json({
      reply: 'Please send "/belfood" first before uploading image.',
    });
  }

  // If /belfood + image
  if (image && commandStarted) {
    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: image.type,
          data: base64,
        },
      },
      "Identify this image clearly and concisely.",
    ]);

    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ reply: text });
  }

  return NextResponse.json({
    reply:
      'Invalid input. Available commands:\n/ping\n/belfood (then upload image)',
  });
}
