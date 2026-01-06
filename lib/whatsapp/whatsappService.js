function safeText(v) {
  return String(v ?? '').trim();
}

function normalizeWhatsappTo(phone) {
  const raw = safeText(phone);
  if (!raw) return '';
  const digits = raw.replace(/\D+/g, '');
  if (!digits) return '';
  if (raw.startsWith('+') && digits.length >= 10) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return `+${digits}`;
}

function has(v) {
  return Boolean(String(v || '').trim());
}

async function sendViaTwilio({ to, body }) {
  const accountSid = String(process.env.TWILIO_ACCOUNT_SID || '').trim();
  const authToken = String(process.env.TWILIO_AUTH_TOKEN || '').trim();
  const from = String(process.env.TWILIO_WHATSAPP_FROM || '').trim();

  if (!accountSid || !authToken || !from) {
    return { ok: false, skipped: true, reason: 'twilio_not_configured' };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const form = new URLSearchParams();
  form.set('From', from.startsWith('whatsapp:') ? from : `whatsapp:${from}`);
  form.set('To', `whatsapp:${to}`);
  form.set('Body', String(body || ''));

  const auth = Buffer.from(`${accountSid}:${authToken}`, 'utf8').toString('base64');

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: `Basic ${auth}`,
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    return { ok: false, error: json || { status: res.status }, provider: 'twilio' };
  }

  return { ok: true, provider: 'twilio', messageId: json?.sid || null, raw: null };
}

async function sendViaMetaCloud({ to, body }) {
  const token = String(process.env.WHATSAPP_CLOUD_TOKEN || '').trim();
  const phoneNumberId = String(process.env.WHATSAPP_PHONE_NUMBER_ID || '').trim();
  const apiVersion = String(process.env.WHATSAPP_CLOUD_API_VERSION || 'v21.0').trim();

  if (!token || !phoneNumberId) {
    return { ok: false, skipped: true, reason: 'meta_not_configured' };
  }

  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    to: to.replace(/^\+/, ''),
    type: 'text',
    text: { body: String(body || '') },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    return { ok: false, error: json || { status: res.status }, provider: 'meta' };
  }

  const msgId = Array.isArray(json?.messages) ? json.messages?.[0]?.id : null;
  return { ok: true, provider: 'meta', messageId: msgId || null, raw: null };
}

export const WhatsAppService = {
  normalizeTo: normalizeWhatsappTo,

  /**
   * Sends a plain text WhatsApp message.
   * If no provider is configured, returns { skipped: true }.
   */
  async sendText({ to, body }) {
    const normalized = normalizeWhatsappTo(to);
    const message = safeText(body);

    if (!normalized || !message) {
      return { ok: false, skipped: true, reason: 'missing_to_or_body' };
    }

    // Prefer Meta Cloud if configured; fallback to Twilio.
    if (has(process.env.WHATSAPP_CLOUD_TOKEN) && has(process.env.WHATSAPP_PHONE_NUMBER_ID)) {
      return sendViaMetaCloud({ to: normalized, body: message });
    }

    if (has(process.env.TWILIO_ACCOUNT_SID) && has(process.env.TWILIO_AUTH_TOKEN) && has(process.env.TWILIO_WHATSAPP_FROM)) {
      return sendViaTwilio({ to: normalized, body: message });
    }

    return { ok: false, skipped: true, reason: 'whatsapp_not_configured' };
  },
};
