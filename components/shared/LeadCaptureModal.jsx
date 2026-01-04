"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

function normalizePhone(v) {
  const raw = String(v || "").trim();
  const onlyDigits = raw.replace(/\D+/g, "");
  if (!onlyDigits) return "";

  // Accept "91XXXXXXXXXX" or "XXXXXXXXXX" and normalize to +91XXXXXXXXXX.
  if (onlyDigits.length === 10) return `+91${onlyDigits}`;
  if (onlyDigits.length === 12 && onlyDigits.startsWith("91")) return `+${onlyDigits}`;

  // If user typed +91..., normalize too.
  const plusDigits = raw.replace(/[^\d+]/g, "");
  if (plusDigits.startsWith("+91") && plusDigits.replace(/\D+/g, "").length === 12) {
    return `+${plusDigits.replace(/\D+/g, "")}`;
  }

  return "";
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
  const [optIn, setOptIn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const canSubmit = useMemo(() => {
    return (
      Boolean(String(name || "").trim()) &&
      isValidEmail(email) &&
      Boolean(normalizePhone(whatsapp)) &&
      Boolean(optIn)
    );
  }, [name, email, whatsapp, optIn]);

  async function handle(action) {
    if (busy) return;
    setErr("");
    if (!canSubmit) {
      setErr("Please enter name, valid email, WhatsApp in +91 format, and consent for WhatsApp updates.");
      return;
    }

    const payload = {
      name: String(name).trim(),
      email: String(email).trim(),
      phone: normalizePhone(whatsapp),
      whatsappOptIn: Boolean(optIn),
    };

    setBusy(true);
    try {
      if (action === "free") await onFree?.(payload);
      else await onPay?.(payload);
    } catch (e) {
      setErr("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-white/10 bg-black/90 text-white max-h-[92vh] overflow-y-auto scrollbar-hide sm:max-w-[760px] lg:max-w-[920px]">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
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
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="border-white/10 bg-white/5 text-white"
              placeholder="+91XXXXXXXXXX"
              inputMode="tel"
              autoComplete="tel"
            />
            <div className="text-xs text-slate-300/70">{whatsappHelpText}</div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox checked={optIn} onCheckedChange={(v) => setOptIn(Boolean(v))} id="waOpt" />
            <Label htmlFor="waOpt" className="text-sm text-slate-200">
              {optInLabel}
            </Label>
          </div>

          {err ? <div className="text-sm text-red-300">{err}</div> : null}

          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="border-white/10 bg-white/5 text-white hover:bg-white/10"
              disabled={busy}
              onClick={() => handle("free")}
            >
              {freeLabel}
            </Button>
            <Button
              type="button"
              className={[
                payButtonClassName?.includes("calculator-premium-cta")
                  ? "calculator-premium-cta"
                  : "bg-[color:var(--color-matte-gold)] text-black hover:bg-[color:var(--color-matte-gold)]/90",
                payButtonClassName,
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={busy}
              onClick={() => handle("pay")}
            >
              {payLabel}
            </Button>
          </div>

          <p className="text-xs text-slate-300/70 whitespace-pre-line">{footerNote}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
