"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ExitIntentModal({ open, onOpenChange, onPrimary, onSecondary }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-white/10 bg-black/90 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Before you close this…</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-slate-200/80">
            You already ran the calculation.<br/>
            Most people stop here — and still overpay.
          </p>
          <p className="text-xs text-slate-200/70">
            The execution plan shows what actually changes your tax outcome.
          </p>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              className="bg-[color:var(--color-matte-gold)] text-black hover:bg-[color:var(--color-matte-gold)]/90"
              onClick={onPrimary}
            >
              Get my execution plan (₹299)
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-white/10 bg-white/5 text-white hover:bg-white/10"
              onClick={onSecondary}
            >
              Email my calculation (free)
            </Button>
          </div>
          <div className="text-[11px] text-slate-300/70">Takes less than 2 minutes</div>

          <div className="flex items-center justify-center">
            <Button
              type="button"
              variant="ghost"
              className="text-slate-300/80 hover:text-white"
              onClick={() => { try { window.history.back(); } catch (_) {} onOpenChange(false); }}
            >
              Go back
            </Button>
          </div>

          <p className="text-xs text-slate-300/70">AMFI ARN 90008 • Educational • No sales calls</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
