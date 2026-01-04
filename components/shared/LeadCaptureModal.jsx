"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

function normalizeWhatsApp(v) {
  const raw = String(v || "").trim();
  if (!raw) return "";

  // Accept formats:
  // +918850977259
  // +91 8850977259
  // 918850977259
  // 8850977259
  const digits = raw.replace(/\D+/g, "");
  if (!digits) return "";

  let tenDigits = "";
  if (digits.length === 10) tenDigits = digits;
  else if (digits.length === 12 && digits.startsWith("91")) tenDigits = digits.slice(2);
  else return "";

  if (!/^[6-9]\d{9}$/.test(tenDigits)) return "";
  return `+91${tenDigits}`;
}

function formatWhatsAppInput(v) {
  const raw = String(v || "");
  const digits = raw.replace(/\D+/g, "");
  if (!digits) return "";

  // While typing:
  // - if user enters 10 digits, auto-prefix +91
  // - if user enters 91XXXXXXXXXX, render as +91XXXXXXXXXX
  if (digits.startsWith("91")) return `+${digits.slice(0, 12)}`;
  if (digits.length < 10) return digits.slice(0, 10);
  return `+91${digits.slice(0, 10)}`;
}

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
}

export function LeadCaptureModal({
  open,
  onOpenChange,
  onFree,
  onPay,
  title = "Get your report",
  body = "",
  freeLabel = "Email Free Summary",
  payLabel = "Unlock Premium Blueprint — ₹299",
  payButtonClassName = "",
  optInLabel = "I agree to receive tax updates and analysis via WhatsApp",
  whatsappHelpText = "Use +91 format so we can send your blueprint instantly.",
  footerNote =
    "ARN 90008 | IRDAI 277925. For education and information only; calculations depend on your inputs and prevailing tax rules. For personalised investment advice, consult a SEBI-registered investment adviser.",
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [whatsappConsent, setWhatsappConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [pendingAction, setPendingAction] = useState("");

  const canSubmit = useMemo(() => {
    return (
      String(name || "").trim().length >= 2 &&
      isValidEmail(email) &&
      Boolean(normalizeWhatsApp(whatsapp))
    );
  }, [name, email, whatsapp]);

  async function handle(action) {
    if (busy) return;
    setErr("");
    setInfo("");
    setPendingAction(action);

    const trimmedName = String(name || "").trim();
    const trimmedEmail = String(email || "").trim();
    const normalizedPhone = normalizeWhatsApp(whatsapp);

    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log("[LeadCaptureModal] Form values:", {
        name: trimmedName,
        email: trimmedEmail,
        whatsapp,
        normalizedPhone,
        consent: whatsappConsent,
      });
      // eslint-disable-next-line no-console
      console.log("[LeadCaptureModal] Validation:", {
        nameValid: trimmedName.length >= 2,
        emailValid: isValidEmail(trimmedEmail),
        whatsappValid: Boolean(normalizedPhone),
      });
    }

    if (trimmedName.length < 2) {
      setErr("Please enter your name.");
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setErr("Please enter a valid email.");
      return;
    }
    if (!normalizedPhone) {
      setErr("Please enter a valid 10-digit mobile number.");
      return;
    }

    const payload = {
      name: trimmedName,
      email: trimmedEmail,
      phone: normalizedPhone,
      whatsappOptIn: Boolean(whatsappConsent),
    };

    setBusy(true);
    setInfo(action === "free" ? "Sending your summary…" : "Starting payment…");
    try {
      if (action === "free") {
        await onFree?.(payload);
        setInfo("Email sent. Please check your inbox (and Spam/Promotions). ");
      } else {
        await onPay?.(payload);
      }
    } catch (e) {
      const msg = typeof e?.message === "string" && e.message.trim() ? e.message.trim() : "Something went wrong. Please try again.";
      setErr(msg);
      setInfo("");
    } finally {
      setBusy(false);
      setPendingAction("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-white/10 bg-black/90 text-white max-h-[92vh] overflow-y-auto scrollbar-hide pointer-events-auto sm:max-w-[760px] lg:max-w-[920px] pt-16 pb-8">
        <DialogHeader>
          <DialogTitle className="text-white text-lg">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {body ? <div className="text-sm text-slate-200/80 whitespace-pre-line">{body}</div> : null}
          <div className="space-y-2">
            <Label className="text-slate-200">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-white/10 bg-white/5 text-white"
              placeholder="Your name"
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-white/10 bg-white/5 text-white"
              placeholder="you@example.com"
              autoComplete="email"
              inputMode="email"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-200">WhatsApp Number</Label>
            <Input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(formatWhatsAppInput(e.target.value))}
              className="border-white/10 bg-white/5 text-white"
              placeholder="+91XXXXXXXXXX"
              inputMode="tel"
              autoComplete="tel"
            />
            <div className="text-xs text-slate-300/70">{whatsappHelpText}</div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={whatsappConsent}
              onCheckedChange={(v) => setWhatsappConsent(Boolean(v))}
              id="waOpt"
            />
            <Label htmlFor="waOpt" className="text-sm text-slate-200">
              {optInLabel}
            </Label>
          </div>

          {err ? <div className="text-sm text-red-300">{err}</div> : null}
          {!err && info ? <div className="text-sm text-slate-200/80">{info}</div> : null}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="secondary-button flex-1 border-white/10 bg-white/5 text-white hover:bg-white/10 disabled:opacity-100"
              disabled={busy}
              onClick={() => handle("free")}
            >
              {busy && pendingAction === "free" ? "Sending…" : freeLabel}
            </Button>
            <Button
              type="button"
              className={[
                "calculator-premium-cta",
                payButtonClassName,
              ]
                .filter(Boolean)
                .concat(["flex-1"])
                .join(" ")}
              disabled={busy}
              onClick={() => handle("pay")}
            >
              {busy && pendingAction === "pay" ? "Starting…" : payLabel}
            </Button>
          </div>

          <p className="text-xs text-slate-300/70 whitespace-pre-line">{footerNote}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
