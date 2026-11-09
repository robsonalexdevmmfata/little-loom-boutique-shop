import { useRouterState } from "@tanstack/react-router";
import { Copy, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCampaignPopup } from "@/lib/cms-extras";

const STORAGE_KEY = "rn-popup-dismiss-v2";

type DismissState = { until: number; fingerprint: string };

function fingerprintOf(cfg: { title: string; text: string; cta: string; couponCode?: string }) {
  return `${cfg.title}|${cfg.text}|${cfg.cta}|${cfg.couponCode ?? ""}`;
}

function readDismiss(): DismissState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DismissState;
  } catch {
    return null;
  }
}

export function CampaignPopup() {
  const [cfg] = useCampaignPopup();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const fp = useMemo(() => fingerprintOf(cfg), [cfg.title, cfg.text, cfg.cta, cfg.couponCode]);

  const onHome = pathname === "/";
  const homeOnly = cfg.homeOnly !== false;
  const allowedPath = homeOnly ? onHome : !pathname.startsWith("/admin") && !pathname.startsWith("/checkout");

  useEffect(() => {
    if (!cfg.active || !allowedPath) {
      setOpen(false);
      return;
    }
    const dismissed = readDismiss();
    if (dismissed && dismissed.fingerprint === fp && Date.now() < dismissed.until) return;

    const delay = Math.max(400, cfg.delayMs ?? 1600);
    const t = window.setTimeout(() => setOpen(true), delay);
    return () => window.clearTimeout(t);
  }, [cfg.active, cfg.delayMs, allowedPath, fp]);

  const dismiss = () => {
    const days = Math.max(1, cfg.dismissDays || 5);
    const state: DismissState = { until: Date.now() + days * 86400000, fingerprint: fp };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const days = Math.max(1, cfg.dismissDays || 5);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ until: Date.now() + days * 86400000, fingerprint: fp }));
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, cfg.dismissDays, fp]);

  if (!open || !cfg.active || !allowedPath) return null;

  const coupon = cfg.couponCode?.trim();
  const href = cfg.ctaHref?.trim() || "/#novidades";

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-wine-deep/55 p-4 backdrop-blur-[2px] sm:items-center" role="dialog" aria-modal="true" aria-labelledby="rn-popup-title" onClick={dismiss}>
      <div
        className="relative w-full max-w-md overflow-hidden border border-[#e4d8cf] bg-[#fbfaf8] shadow-[0_24px_80px_rgba(61,20,24,0.35)] animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-wine via-champagne to-wine" />
        <button type="button" aria-label="Fechar" onClick={dismiss} className="absolute top-3 right-3 grid h-8 w-8 place-items-center text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700">
          <X className="h-4 w-4" />
        </button>
        <div className="px-6 pt-7 pb-6 sm:px-8">
          <p className="text-[10px] tracking-[0.35em] text-wine/60 uppercase">Oferta da loja</p>
          <h2 id="rn-popup-title" className="mt-2 font-display text-3xl leading-tight text-wine">
            {cfg.title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600">{cfg.text}</p>
          {coupon && (
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(coupon);
                toast.success(`Cupom ${coupon} copiado`);
              }}
              className="mt-5 inline-flex items-center gap-2 border border-dashed border-wine/40 bg-blush/60 px-3 py-2 text-sm font-medium tracking-wide text-wine transition hover:bg-blush"
            >
              <span className="font-mono text-base tracking-[0.12em]">{coupon}</span>
              <Copy className="h-3.5 w-3.5 opacity-70" />
              <span className="text-[11px] font-normal text-wine/70">copiar</span>
            </button>
          )}
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
            <a
              href={href}
              onClick={dismiss}
              className="inline-flex h-11 flex-1 items-center justify-center bg-wine px-5 text-[11px] font-medium tracking-[0.18em] text-ivory uppercase transition hover:bg-wine-deep"
            >
              {cfg.cta || "Ver coleção"}
            </a>
            <button type="button" onClick={dismiss} className="h-11 px-4 text-xs text-zinc-500 underline-offset-2 hover:text-zinc-800 hover:underline">
              Agora não
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
