import { NextResponse } from "next/server";

type ChatRequestBody = {
  message?: string;
};

export async function POST(request: Request) {
  let body: ChatRequestBody | null = null;

  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Gecersiz JSON gonderildi." },
      { status: 400 },
    );
  }

  const userMessage = body?.message?.trim();

  if (!userMessage) {
    return NextResponse.json(
      { error: "Mesaj alani bos birakilamaz." },
      { status: 400 },
    );
  }

  const reply = [
    "MVP fallback yanit: ",
    `"${userMessage}" mesajini aldim.`,
    "Bir sonraki adimda buraya gercek LLM entegrasyonu eklenebilir.",
  ].join(" ");

  return NextResponse.json({ reply }, { status: 200 });
}
