import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { getServerEnvSafe } from "@/lib/env";
import { isAdminFromCookies } from "@/lib/adminSession";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const reqSchema = z.object({
  message: z.string().min(1).max(6000),
  leadId: z.string().uuid().optional(),
  mode: z.enum(["user", "admin"]).optional(),
});

const COMPLIANCE_TEXT =
  "Welcome to BM Wealth. We provide educational guidance and product \n" +
  "distribution services. AMFI Registered • IRDAI Licensed • \n" +
  "Investments subject to market dynamics.";

async function saveConversation({ leadId, message, sender }) {
  if (!leadId) return;
  const sb = supabaseAdmin();
  await sb.from("conversations").insert({ lead_id: leadId, message, sender }).throwOnError();
}

async function callGemini({ apiKey, userText }) {
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
    encodeURIComponent(apiKey);

  const system = `You are BM Wealth AI assistant. You MUST be SEBI-compliant: provide only educational information, general explanations, and product distribution guidance. Do NOT give personalized investment advice, price targets, or specific buy/sell/hold recommendations. Always include this compliance line near the end: "${COMPLIANCE_TEXT}"`;

  const body = {
    contents: [
      { role: "user", parts: [{ text: system }] },
      { role: "user", parts: [{ text: userText }] },
    ],
    generationConfig: { temperature: 0.5, maxOutputTokens: 600 },
  };

  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`Gemini error: ${r.status} ${t}`);
  }

  const json = await r.json();
  const text =
    json?.candidates?.[0]?.content?.parts?.map((p) => p?.text).filter(Boolean).join("") ||
    "I can help with educational guidance. " + COMPLIANCE_TEXT;
  return text.trim();
}

async function callClaude({ apiKey, userText }) {
  const url = "https://api.anthropic.com/v1/messages";
  const system =
    `You are BM Wealth Admin AI assistant. Provide operational guidance for BM Wealth business (analytics, funnels, copy). ` +
    `Do not produce personalized investment advice. Always keep compliance text available: "${COMPLIANCE_TEXT}"`;

  const body = {
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 800,
    temperature: 0.4,
    system,
    messages: [{ role: "user", content: userText }],
  };

  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`Claude error: ${r.status} ${t}`);
  }

  const json = await r.json();
  const text =
    json?.content?.map((c) => (c?.type === "text" ? c.text : "")).filter(Boolean).join("") ||
    "Admin assistant ready.";
  return text.trim();
}

export async function POST(req) {
  const env = getServerEnvSafe();
  const cookieStore = await cookies();
  const isAdmin = isAdminFromCookies(cookieStore);

  const body = await req.json().catch(() => ({}));
  const parsed = reqSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const { message, leadId } = parsed.data;
  const mode = parsed.data.mode || "user";

  // Persist user message (best-effort)
  try {
    await saveConversation({ leadId, message, sender: "user" });
  } catch {
    // ignore if DB not configured yet
  }

  try {
    let reply;
    if (mode === "admin") {
      if (!isAdmin) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
      if (!env?.ANTHROPIC_API_KEY) throw new Error("setup_required");
      reply = await callClaude({ apiKey: env.ANTHROPIC_API_KEY, userText: message });
    } else {
      if (!env?.GEMINI_API_KEY) throw new Error("setup_required");
      reply = await callGemini({ apiKey: env.GEMINI_API_KEY, userText: message });
      // Ensure compliance line present
      if (!reply.includes("Welcome to BM Wealth")) {
        reply = `${reply}\n\n${COMPLIANCE_TEXT}`;
      }
    }

    try {
      await saveConversation({ leadId, message: reply, sender: "bot" });
    } catch {
      // ignore if DB not configured yet
    }
    return NextResponse.json({ ok: true, reply });
  } catch (e) {
    const msg = e?.message || "chat_failed";
    const fallback = `I can help with educational guidance. ${COMPLIANCE_TEXT}`;
    try {
      await saveConversation({ leadId, message: fallback, sender: "bot" });
    } catch {
      // ignore
    }
    return NextResponse.json({ ok: true, reply: fallback, warn: msg });
  }
}


