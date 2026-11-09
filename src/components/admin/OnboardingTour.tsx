import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { AdminGo } from "./DashboardPanel";

const KEY = "rn-admin-tour-v1";

const steps: { title: string; text: string; go: AdminGo }[] = [
  { title: "Cadastre produtos", text: "Suba fotos, preço, estoque e publique na vitrine.", go: "Produtos" },
  { title: "Configure Meta Ads", text: "Cole o Pixel do Facebook/Instagram para medir vendas dos anúncios.", go: "Meta Ads" },
  { title: "Personalize a loja", text: "Banner, slides e textos em Aparência — com prévia ao vivo.", go: "Aparência" },
  { title: "Acompanhe pedidos", text: "Atualize status, imprima e fale no WhatsApp pelo painel.", go: "Pedidos" },
];

export function OnboardingTour({ onGo }: { onGo: (t: AdminGo) => void }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(KEY) !== "1") setOpen(true);
  }, []);

  if (!open) return null;

  return (
    <div className="mb-5 overflow-hidden rounded-xl border border-wine/20 bg-gradient-to-r from-wine/[0.06] to-champagne/20">
      <div className="flex items-start justify-between gap-3 px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-zinc-900">Bem-vinda ao CMS REIS NOIR</p>
          <p className="mt-0.5 text-xs text-zinc-600">Roteiro rápido para deixar a loja pronta de verdade</p>
        </div>
        <button
          type="button"
          className="rounded-md p-1 text-zinc-400 hover:bg-white hover:text-zinc-700"
          aria-label="Fechar tour"
          onClick={() => {
            localStorage.setItem(KEY, "1");
            setOpen(false);
          }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="grid gap-2 px-5 pb-5 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <button
            key={s.go}
            type="button"
            onClick={() => {
              onGo(s.go);
              localStorage.setItem(KEY, "1");
              setOpen(false);
            }}
            className="rounded-lg border border-white/80 bg-white/90 p-3 text-left shadow-sm transition hover:border-wine/30"
          >
            <p className="text-[10px] font-semibold tracking-wide text-wine uppercase">Passo {i + 1}</p>
            <p className="mt-1 text-sm font-medium text-zinc-900">{s.title}</p>
            <p className="mt-1 text-[11px] text-zinc-500">{s.text}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
