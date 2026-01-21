"use client";

import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ExitIntentModal({
  open,
  onOpenChange,
  onPrimary,
  onSecondary,
  title = "Quick note",
  primaryLabel = "Open in Digital Store",
  primaryButtonClassName = "",
  secondaryLabel = "Email my calculation (free)",
  bodyPrimary = "You’ve already run the calculation.",
  bodySecondary =
    "If you’d like, we can email your result now, or you can view the detailed PDF/tools on our Digital Store.",
  note = "Takes less than 2 minutes",
  footerNote = "AMFI ARN 90008 • Educational • No sales calls",
  suppressKey = null,
}) {
  useEffect(() => {
    if (!open) return;
    if (!suppressKey) return;
    try {
      if (localStorage.getItem(String(suppressKey))) {
        onOpenChange(false);
      }
    } catch {
      // best-effort
    }
  }, [open, suppressKey, onOpenChange]);

  function suppress() {
    if (!suppressKey) return;
    try {
      localStorage.setItem(String(suppressKey), "1");
    } catch {
      // best-effort
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-white/10 bg-black/90 text-white max-h-[85vh] overflow-y-auto scrollbar-hide pointer-events-auto pt-16 pb-8">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-slate-200/80 whitespace-pre-line">
            {bodyPrimary}
          </p>
          <p className="text-xs text-slate-200/70 whitespace-pre-line">
            {bodySecondary}
          </p>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="secondary-button flex-1 border-white/10 bg-white/5 text-white hover:bg-white/10"
              onClick={() => {
                suppress();
                onSecondary?.();
              }}
            >
              {secondaryLabel}
            </Button>
            <Button
              type="button"
              className={[
                "calculator-premium-cta",
                primaryButtonClassName,
              ]
                .filter(Boolean)
                .concat(["flex-1"])
                .join(" ")}
              onClick={() => {
                suppress();
                onPrimary?.();
              }}
            >
              {primaryLabel}
            </Button>
          </div>
          {note ? <div className="text-[11px] text-slate-300/70">{note}</div> : null}

          <div className="flex items-center justify-center">
            <Button
              type="button"
              variant="ghost"
              className="text-slate-300/80 hover:text-white"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>

          {footerNote ? <p className="text-xs text-slate-300/70">{footerNote}</p> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
