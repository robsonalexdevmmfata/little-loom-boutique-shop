import { MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { brl, useSettings } from "@/lib/store";
import { useAbandonedCarts } from "@/lib/cms-extras";
import { PageHeader, Panel } from "./shared";

export function AbandonedPanel() {
  const [carts, setCarts] = useAbandonedCarts();
  const [settings] = useSettings();
  const waBase = settings.footerWhatsappNumber.replace(/\D/g, "");

  const stale = carts.filter((c) => c.items.length > 0);

  return (
    <div>
      <PageHeader title="Sacolas" subtitle="Carrinhos abandonados neste navegador / sessão — lembrete via WhatsApp" />
      <div className="space-y-3">
        {stale.map((c) => {
          const mins = Math.round((Date.now() - new Date(c.updatedAt).getTime()) / 60000);
          const msg = encodeURIComponent(
            `Oi${c.email ? ` (${c.email})` : ""}! Vi que você deixou peças na sacola REIS NOIR (${c.items.map((i) => i.name).join(", ")}). Posso te ajudar a finalizar?`,
          );
          const phone = (c.phone || "").replace(/\D/g, "") || waBase;
          return (
            <Panel key={c.id} className="flex flex-wrap items-start justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-medium text-zinc-900">
                  {c.items.length} item(ns) · ~{brl(c.totalHint)} · há {mins < 60 ? `${mins} min` : `${Math.round(mins / 60)} h`}
                </p>
                <ul className="mt-1 text-xs text-zinc-500">
                  {c.items.map((i) => (
                    <li key={`${i.productId}-${i.size}`}>
                      {i.name} · {i.size} × {i.qty}
                    </li>
                  ))}
                </ul>
                {(c.email || c.phone) && (
                  <p className="mt-1 text-xs text-zinc-400">
                    {c.email} {c.phone}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <a
                  href={`https://wa.me/${phone}?text=${msg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-md bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-700"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setCarts(carts.filter((x) => x.id !== c.id));
                    toast.success("Removido");
                  }}
                  className="grid h-9 w-9 place-items-center rounded-md border border-zinc-200 text-zinc-500 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </Panel>
          );
        })}
        {stale.length === 0 && (
          <Panel className="p-10 text-center text-sm text-zinc-500">Nenhuma sacola abandonada registrada ainda.</Panel>
        )}
      </div>
    </div>
  );
}
