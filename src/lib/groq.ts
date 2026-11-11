import "server-only";
import { supabase } from "./supabase";
import { getBool, getInt, getSetting } from "./settings";

/** Groq's OpenAI-compatible endpoint. GROQ_BASE_URL exists only for local testing against a mock. */
const BASE = () => process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";

export class AiError extends Error {
  constructor(
    message: string,
    public status = 503,
  ) {
    super(message);
  }
}

async function call(path: string, key: string, init: RequestInit = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 30_000);
  try {
    return await fetch(`${BASE()}${path}`, {
      ...init,
      signal: ctrl.signal,
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
    });
  } catch {
    throw new AiError("The writing assistant couldn't be reached. Please try again in a moment.");
  } finally {
    clearTimeout(t);
  }
}

function explain(status: number) {
  if (status === 401 || status === 403) return new AiError("The AI key is not valid. The site admin needs to update it.", 503);
  if (status === 429) return new AiError("The writing assistant is busy right now. Please try again in a minute.", 429);
  if (status === 404) return new AiError("The AI model isn't available. The site admin needs to pick another model.", 503);
  return new AiError("The writing assistant had a problem. Please try again.", 502);
}

export interface ChatOpts {
  system: string;
  user: string;
  json?: boolean;
  maxTokens?: number;
  temperature?: number;
  /** Use an explicit key (admin "test connection"); otherwise the saved one. */
  key?: string;
  model?: string;
}

export async function chat(o: ChatOpts): Promise<{ text: string; tokens: number }> {
  const key = o.key ?? (await getSetting("groq.apiKey"));
  if (!key) throw new AiError("AI features aren't set up yet. The site admin needs to add a Groq key.", 503);
  const res = await call("/chat/completions", key, {
    method: "POST",
    body: JSON.stringify({
      model: o.model ?? (await getSetting("groq.model")),
      messages: [
        { role: "system", content: o.system },
        { role: "user", content: o.user },
      ],
      max_tokens: o.maxTokens ?? 700,
      temperature: o.temperature ?? 0.8,
      ...(o.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) throw explain(res.status);
  const data = (await res.json().catch(() => null)) as { choices?: { message?: { content?: string } }[]; usage?: { total_tokens?: number } } | null;
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new AiError("The writing assistant returned nothing. Please try again.", 502);
  return { text, tokens: data?.usage?.total_tokens ?? 0 };
}

/** chat() that must return a JSON object; one retry if the model slips. */
export async function chatJson<T>(o: Omit<ChatOpts, "json">): Promise<{ data: T; tokens: number }> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const { text, tokens } = await chat({ ...o, json: true });
    try {
      const m = text.match(/\{[\s\S]*\}/);
      return { data: JSON.parse(m ? m[0] : text) as T, tokens };
    } catch {
      /* retry */
    }
  }
  throw new AiError("The writing assistant gave an unexpected answer. Please try again.", 502);
}

/** Check a key + model for the admin's "Test connection". */
export async function testGroq(key: string, model: string) {
  const res = await call("/models", key);
  if (!res.ok) throw explain(res.status);
  const list = ((await res.json().catch(() => null)) as { data?: { id: string }[] } | null)?.data?.map((m) => m.id) ?? [];
  if (list.length && !list.includes(model)) {
    throw new AiError(`The key works, but the model "${model}" isn't available. Try one of: ${list.filter((m) => !/whisper|guard|tts/i.test(m)).slice(0, 6).join(", ")}`, 400);
  }
  const { text } = await chat({ key, model, system: "Reply with exactly: OK", user: "Ping", maxTokens: 5, temperature: 0 });
  return { models: list, reply: text };
}

const startOfDay = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/** Is AI available for this couple right now? Throws a friendly AiError if not. */
export async function assertAiAllowed(userId: string, site: { id: string; premium: boolean }) {
  if (!(await getBool("ai.enabled"))) throw new AiError("AI features are switched off right now.", 503);
  if (!(await getSetting("groq.apiKey"))) throw new AiError("AI features aren't set up yet. The site admin needs to add a Groq key.", 503);
  if ((await getBool("pay.enabled")) && (await getSetting("pay.features")).split(",").includes("ai") && !site.premium) {
    throw new AiError("The writing assistant is part of Premium. Upgrade this site to use it.", 402);
  }
  const since = startOfDay().toISOString();
  const { count: used } = await supabase.from("AiUsage").select("*", { count: "exact", head: true }).eq("userId", userId).gte("createdAt", since);
  if ((used ?? 0) >= (await getInt("ai.dailyLimit"))) throw new AiError("You've used today's AI requests. They reset at midnight.", 429);
}

export async function recordAi(feature: string, opts: { userId?: string; siteId?: string; tokens?: number; ok?: boolean }) {
  const id = "ai_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
  await supabase.from("AiUsage").insert({
    id,
    feature,
    userId: opts.userId,
    siteId: opts.siteId,
    tokens: opts.tokens ?? 0,
    ok: opts.ok ?? true,
    createdAt: new Date().toISOString(),
  });
}

export async function guestQuestionsToday(siteId: string) {
  const since = startOfDay().toISOString();
  const { count } = await supabase.from("AiUsage").select("*", { count: "exact", head: true }).eq("siteId", siteId).eq("feature", "guest-helper").gte("createdAt", since);
  return count ?? 0;
}
