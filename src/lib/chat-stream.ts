import { supabase } from "@/integrations/supabase/client";

export type Msg = { role: "user" | "assistant"; content: string; images?: string[] };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nexo-chat`;

export async function streamChat({
  messages,
  mode,
  onDelta,
  onImage,
  onDone,
  onError,
}: {
  messages: Msg[];
  mode?: string;
  onDelta: (text: string) => void;
  onImage?: (url: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
}) {
  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages, mode }),
    });

    if (resp.status === 429) {
      onError("Rate limit excedido. Tente novamente em alguns segundos.");
      return;
    }
    if (resp.status === 402) {
      onError("Créditos insuficientes. Adicione créditos ao seu workspace.");
      return;
    }

    // Check if response is an image (for image generation mode)
    const contentType = resp.headers.get("content-type") || "";
    if (contentType.includes("application/json") && mode === "image") {
      const data = await resp.json();
      if (data.image) {
        onImage?.(data.image);
        onDone();
        return;
      }
      if (data.error) {
        onError(data.error);
        return;
      }
    }

    if (!resp.ok || !resp.body) {
      onError("Falha ao conectar com a IA.");
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIdx: number;
      while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newlineIdx);
        buffer = buffer.slice(newlineIdx + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }

    onDone();
  } catch (e) {
    onError(e instanceof Error ? e.message : "Erro desconhecido");
  }
}
