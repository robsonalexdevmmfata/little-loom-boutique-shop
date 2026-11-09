import { AlertTriangle, Bell, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCommerce, useOrders, useProducts } from "@/lib/store";
import type { AdminGo } from "./DashboardPanel";

type Note = {
  id: string;
  title: string;
  text: string;
  go: AdminGo;
  kind: "order" | "stock";
};

export function AdminNotifications({ onGo }: { onGo: (t: AdminGo) => void }) {
  const [orders] = useOrders();
  const [products] = useProducts();
  const [commerce] = useCommerce();
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(0);
  const prevAwaiting = useRef(0);
  const threshold = commerce.lowStockThreshold ?? 5;

  const notes = useMemo(() => {
    const list: Note[] = [];
    orders
      .filter((o) => o.status === "Aguardando pagamento")
      .slice(0, 8)
      .forEach((o) => {
        list.push({
          id: `o-${o.id}`,
          title: `Pedido ${o.id}`,
          text: `${o.customer} · aguardando pagamento`,
          go: "Pedidos",
          kind: "order",
        });
      });
    products
      .filter((p) => p.stock <= threshold)
      .slice(0, 8)
      .forEach((p) => {
        list.push({
          id: `s-${p.id}`,
          title: p.name,
          text: `Estoque baixo · ${p.stock} un.`,
          go: "Produtos",
          kind: "stock",
        });
      });
    return list;
  }, [orders, products, threshold]);

  const awaiting = orders.filter((o) => o.status === "Aguardando pagamento").length;

  useEffect(() => {
    if (awaiting > prevAwaiting.current && prevAwaiting.current > 0) {
      try {
        const ctx = new AudioContext();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.value = 880;
        g.gain.value = 0.03;
        o.start();
        o.stop(ctx.currentTime + 0.12);
      } catch {
        /* ignore */
      }
    }
    prevAwaiting.current = awaiting;
  }, [awaiting]);

  const unread = Math.max(0, notes.length - seen);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) setSeen(notes.length);
        }}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
        aria-label="Avisos"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-wine px-1 text-[10px] font-semibold text-ivory">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <button type="button" className="fixed inset-0 z-40" aria-label="Fechar avisos" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl">
            <div className="border-b border-zinc-100 px-3 py-2.5">
              <p className="text-sm font-semibold text-zinc-900">Central de avisos</p>
              <p className="text-[11px] text-zinc-500">{notes.length} pendência{notes.length === 1 ? "" : "s"}</p>
            </div>
            <ul className="max-h-80 overflow-auto">
              {notes.length === 0 && <li className="px-3 py-8 text-center text-sm text-zinc-500">Nada pendente agora</li>}
              {notes.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className="flex w-full items-start gap-2 px-3 py-2.5 text-left hover:bg-zinc-50"
                    onClick={() => {
                      onGo(n.go);
                      setOpen(false);
                    }}
                  >
                    <span className={`mt-0.5 grid h-7 w-7 place-items-center rounded-md ${n.kind === "order" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}>
                      {n.kind === "order" ? <ShoppingBag className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-zinc-900">{n.title}</span>
                      <span className="block text-xs text-zinc-500">{n.text}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
