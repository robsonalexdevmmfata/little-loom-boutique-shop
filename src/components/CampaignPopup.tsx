import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCampaignPopup } from "@/lib/cms-extras";

const KEY = "rn-popup-dismissed";

export function CampaignPopup() {
  const [cfg] = useCampaignPopup();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!cfg.active) return;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const until = Number(raw);
        if (Date.now() < until) return;
      }
    } catch {
      /* ignore */
    }
    const t = window.setTimeout(() => setOpen(true), 1200);
    return () => window.clearTimeout(t);
  }, [cfg.active, cfg.title]);

  if (!open || !cfg.active) return null;

  const dismiss = () => {
    const days = Math.max(1, cfg.dismissDays || 7);
    localStorage.setItem(KEY, String(Date.now() + days * 86400000));
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md border border-[#e4d8cf] bg-white p-6 shadow-2xl">
        <button type="button" aria-label="Fechar" onClick={dismiss} className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-700">
          <X className="h-4 w-4" />
        </button>
        <p className="font-display text-2xl text-wine">{cfg.title}</p>
        <p className="mt-2 text-sm text-zinc-600">{cfg.text}</p>
        <a
          href={cfg.ctaHref || "/"}
          onClick={dismiss}
          className="mt-5 inline-flex h-11 items-center justify-center bg-wine px-5 text-sm font-medium text-ivory hover:bg-wine-deep"
        >
          {cfg.cta || "Ver mais"}
        </a>
      </div>
    </div>
  );
}
