"use client";

import { FormEvent, useState } from "react";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Merhaba! Ben MVP asistaninim. Bana bir sey sorabilirsin.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedInput = input.trim();

    if (!trimmedInput || loading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedInput,
    };

    setInput("");
    setError("");
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmedInput }),
      });

      if (!response.ok) {
        throw new Error("Chat endpoint bir hata dondurdu.");
      }

      const data = (await response.json()) as { reply?: string };

      if (!data.reply) {
        throw new Error("Gecerli bir asistan yaniti alinamadi.");
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setError("Mesaj gonderilirken bir sorun olustu. Lutfen tekrar dene.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="chat-page">
      <section className="chat-shell">
        <header className="chat-header">
          <h1>ChatGPT Clone MVP</h1>
          <p>Next.js App Router uzerinde basit sohbet deneyimi.</p>
        </header>

        <div className="chat-messages">
          {messages.map((message) => (
            <article key={message.id} className={`message message-${message.role}`}>
              <span className="message-role">
                {message.role === "user" ? "Sen" : "Asistan"}
              </span>
              <p>{message.content}</p>
            </article>
          ))}
          {loading && <p className="status-text">Asistan yaziyor...</p>}
        </div>

        <form className="chat-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Mesajini yaz..."
            aria-label="Mesaj girisi"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            Gonder
          </button>
        </form>

        {error && <p className="error-text">{error}</p>}
      </section>
    </main>
  );
}
