"use client";

import { FormEvent, useMemo, useState } from "react";

type ChatRole = "user" | "assistant";
type ConnectionMode = "local" | "external";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type ApiConfig = {
  mode: ConnectionMode;
  apiUrl: string;
  apiKey: string;
  model: string;
};

const STORAGE_KEY = "chatgpt-clone-api-config";

export default function Home() {
  const initialConfig = (() => {
    const defaults: ApiConfig = {
      mode: "local",
      apiUrl: "https://api.openai.com/v1/chat/completions",
      apiKey: "",
      model: "gpt-4o-mini",
    };

    if (typeof window === "undefined") {
      return defaults;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw) as Partial<ApiConfig>;
      return {
        mode: parsed.mode === "external" ? "external" : "local",
        apiUrl: parsed.apiUrl || defaults.apiUrl,
        apiKey: parsed.apiKey || "",
        model: parsed.model || defaults.model,
      };
    } catch {
      return defaults;
    }
  })();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        "Hos geldin. Once baglanti ayarini sec, ardindan profesyonel sohbet arayuzunden devam et.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [config, setConfig] = useState<ApiConfig>(initialConfig);
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupMessage, setSetupMessage] = useState("");
  const [isConfigured, setIsConfigured] = useState(
    initialConfig.mode === "local" ||
      Boolean(initialConfig.apiUrl && initialConfig.apiKey),
  );

  const canTest = useMemo(() => {
    if (config.mode === "local") return true;
    return Boolean(config.apiUrl.trim() && config.apiKey.trim() && config.model.trim());
  }, [config]);

  const saveConfig = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  };

  const testConnection = async () => {
    if (!canTest) {
      setSetupMessage("Gerekli alanlari doldurmadan test yapamazsin.");
      setIsConfigured(false);
      return;
    }

    setSetupLoading(true);
    setSetupMessage("");
    setError("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "connection test",
          testOnly: true,
          mode: config.mode,
          externalApiUrl: config.apiUrl,
          externalApiKey: config.apiKey,
          model: config.model,
        }),
      });

      const data = (await response.json()) as { reply?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Baglanti testi basarisiz.");
      }

      saveConfig();
      setIsConfigured(true);
      setSetupMessage(
        config.mode === "local"
          ? "Local fallback aktif. Direkt chat ekraninda devam edebilirsin."
          : "API baglantisi basarili. Ayarlar kaydedildi, chat kullanima hazir.",
      );
    } catch (setupError) {
      const message =
        setupError instanceof Error ? setupError.message : "Baglanti testi basarisiz.";
      setSetupMessage(message);
      setIsConfigured(false);
    } finally {
      setSetupLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedInput = input.trim();

    if (!trimmedInput || loading || !isConfigured) {
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
        body: JSON.stringify({
          message: trimmedInput,
          mode: config.mode,
          externalApiUrl: config.apiUrl,
          externalApiKey: config.apiKey,
          model: config.model,
        }),
      });

      const data = (await response.json()) as { reply?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Chat endpoint bir hata dondurdu.");
      }

      if (!data.reply) {
        throw new Error("Gecerli bir asistan yaniti alinamadi.");
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (sendError) {
      const message =
        sendError instanceof Error
          ? sendError.message
          : "Mesaj gonderilirken bir sorun olustu. Lutfen tekrar dene.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="chat-page">
      <section className="chat-shell">
        <header className="chat-header">
          <div>
            <h1>ChatGPT Clone</h1>
            <p>Profesyonel arayuz + Local veya External API baglanti yonetimi</p>
          </div>
          <span className={`status-pill ${isConfigured ? "online" : "offline"}`}>
            {isConfigured ? "Ready" : "Setup gerekli"}
          </span>
        </header>

        <section className="setup-panel">
          <div className="setup-title-row">
            <h2>Baglanti Kurulumu</h2>
            <p>API testini gecince buradan direkt chat kullanimina devam edersin.</p>
          </div>

          <div className="mode-toggle">
            <button
              type="button"
              className={config.mode === "local" ? "active" : ""}
              onClick={() => {
                setConfig((prev) => ({ ...prev, mode: "local" }));
                setIsConfigured(false);
              }}
            >
              Local Fallback
            </button>
            <button
              type="button"
              className={config.mode === "external" ? "active" : ""}
              onClick={() => {
                setConfig((prev) => ({ ...prev, mode: "external" }));
                setIsConfigured(false);
              }}
            >
              External API
            </button>
          </div>

          {config.mode === "external" && (
            <div className="setup-fields">
              <label>
                API URL
                <input
                  type="url"
                  value={config.apiUrl}
                  onChange={(event) =>
                    setConfig((prev) => ({ ...prev, apiUrl: event.target.value }))
                  }
                  placeholder="https://api.openai.com/v1/chat/completions"
                />
              </label>
              <label>
                API Key
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(event) =>
                    setConfig((prev) => ({ ...prev, apiKey: event.target.value }))
                  }
                  placeholder="sk-..."
                />
              </label>
              <label>
                Model
                <input
                  type="text"
                  value={config.model}
                  onChange={(event) =>
                    setConfig((prev) => ({ ...prev, model: event.target.value }))
                  }
                  placeholder="gpt-4o-mini"
                />
              </label>
            </div>
          )}

          <div className="setup-actions">
            <button type="button" onClick={testConnection} disabled={!canTest || setupLoading}>
              {setupLoading ? "Test ediliyor..." : "Baglantiyi test et ve devam et"}
            </button>
            {setupMessage && <p className="setup-message">{setupMessage}</p>}
          </div>
        </section>

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
            placeholder={
              isConfigured ? "Mesajini yaz..." : "Once baglanti testini tamamla..."
            }
            aria-label="Mesaj girisi"
            disabled={loading || !isConfigured}
          />
          <button type="submit" disabled={loading || !input.trim() || !isConfigured}>
            Gonder
          </button>
        </form>

        {error && <p className="error-text">{error}</p>}
      </section>
    </main>
  );
}
