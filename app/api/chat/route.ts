import { NextResponse } from "next/server";

type ChatRequestBody = {
  message?: string;
  mode?: "local" | "external";
  externalApiUrl?: string;
  externalApiKey?: string;
  model?: string;
  testOnly?: boolean;
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
  const mode = body?.mode === "external" ? "external" : "local";
  const model = body?.model?.trim() || "gpt-4o-mini";
  const testOnly = Boolean(body?.testOnly);

  if (!userMessage) {
    return NextResponse.json(
      { error: "Mesaj alani bos birakilamaz." },
      { status: 400 },
    );
  }

  if (mode === "external") {
    const apiUrl = body?.externalApiUrl?.trim();
    const apiKey = body?.externalApiKey?.trim();

    if (!apiUrl || !apiKey) {
      return NextResponse.json(
        { error: "External API modu icin API URL ve API Key zorunludur." },
        { status: 400 },
      );
    }

    try {
      const externalResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: userMessage }],
          temperature: 0.7,
        }),
      });

      const externalJson = (await externalResponse.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        error?: { message?: string };
      };

      if (!externalResponse.ok) {
        const apiError = externalJson.error?.message || "External API hatasi olustu.";
        return NextResponse.json({ error: apiError }, { status: externalResponse.status });
      }

      const reply = externalJson.choices?.[0]?.message?.content?.trim();

      if (!reply) {
        return NextResponse.json(
          { error: "External API gecerli bir yanit dondurmedi." },
          { status: 502 },
        );
      }

      if (testOnly) {
        return NextResponse.json({ reply: "API baglanti testi basarili." }, { status: 200 });
      }

      return NextResponse.json({ reply }, { status: 200 });
    } catch {
      return NextResponse.json(
        { error: "External API baglantisi kurulamadi." },
        { status: 502 },
      );
    }
  }

  const reply = [
    "MVP fallback yanit: ",
    `"${userMessage}" mesajini aldim.`,
    "Bir sonraki adimda buraya gercek LLM entegrasyonu eklenebilir.",
  ].join(" ");

  if (testOnly) {
    return NextResponse.json({ reply: "Local fallback baglantisi hazir." }, { status: 200 });
  }

  return NextResponse.json({ reply }, { status: 200 });
}
