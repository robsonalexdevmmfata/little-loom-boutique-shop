import { AlertTriangle, MessageCircle, Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { getAdminSession, logActivity } from "@/lib/cms-extras";
import { brl, stockForSize, useCommerce, useProducts, useSettings, withSyncedStock, type Product } from "@/lib/store";
import { PageHeader, Panel, ProductStatusBadge, field } from "./shared";

export function InventoryPanel() {
  const [products, setProducts] = useProducts();
  const [commerce] = useCommerce();
  const [settings] = useSettings();
  const [q, setQ] = useState("");
  const [onlyLow, setOnlyLow] = useState(false);
  const threshold = commerce.lowStockThreshold ?? 5;
  const wa = settings.footerWhatsappNumber.replace(/\D/g, "");

  const list = useMemo(() => {
    return products
      .filter((p) => {
        const match = p.name.toLowerCase().includes(q.toLowerCase()) || (p.sku ?? "").toLowerCase().includes(q.toLowerCase());
        if (!match) return false;
        if (onlyLow) return p.stock <= threshold;
        return true;
      })
      .sort((a, b) => a.stock - b.stock);
  }, [products, q, onlyLow, threshold]);

  const low = products.filter((p) => p.stock <= threshold);
  const lowCount = low.length;
  const zeroCount = products.filter((p) => p.stock <= 0).length;
  const units = products.reduce((a, p) => a + p.stock, 0);

  const apply = (id: string, next: Product) => {
    const synced = withSyncedStock(next);
    setProducts(products.map((p) => (p.id === id ? synced : p)));
    logActivity(getAdminSession()?.name ?? "Admin", "Estoque", `${synced.name}: ${synced.stock} un.`);
  };

  const setStock = (id: string, stock: number) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    apply(id, { ...p, stock: Math.max(0, Math.round(stock)), stockBySize: undefined });
  };

  const setSizeStock = (p: Product, size: string, qty: number) => {
    const stockBySize = { ...(p.stockBySize ?? {}), [size]: Math.max(0, Math.round(qty)) };
    apply(p.id, { ...p, stockBySize });
  };

  const bump = (p: Product, delta: number) => {
    setStock(p.id, p.stock + delta);
    toast.success(`${p.name}: estoque ${Math.max(0, p.stock + delta)}`);
  };

  const alertMsg = encodeURIComponent(
    `Alerta estoque REIS NOIR:\n${low
      .slice(0, 12)
      .map((p) => `• ${p.name}: ${p.stock} un.`)
      .join("\n")}`,
  );

  return (
    <div>
      <PageHeader
        title="Estoque"
        subtitle="Unidades totais, por tamanho e alertas de ruptura"
        actions={
          <div className="flex flex-wrap gap-2">
            {lowCount > 0 && (
              <a
                href={`https://wa.me/${wa}?text=${alertMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-700"
              >
                <MessageCircle className="h-3.5 w-3.5" /> Alertar no WhatsApp
              </a>
            )}
            <button
              type="button"
              onClick={() => setOnlyLow((v) => !v)}
              className={`inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-xs font-medium ${
                onlyLow ? "bg-amber-100 text-amber-900" : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" /> Só estoque baixo
            </button>
          </div>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Panel className="p-4">
          <p className="text-xs text-zinc-500">Unidades totais</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{units}</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs text-zinc-500">Estoque baixo (≤ {threshold})</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-amber-700">{lowCount}</p>
        </Panel>
        <Panel className="p-4">
          <p className="text-xs text-zinc-500">Zerados</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-red-600">{zeroCount}</p>
        </Panel>
      </div>

      <Panel className="overflow-hidden">
        <div className="border-b border-zinc-100 px-4 py-3">
          <input className={`${field} max-w-md`} placeholder="Buscar produto ou SKU…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-zinc-50 text-left text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
              <tr>
                <th className="px-4 py-3">Produto</th>
                <th className="px-3 py-3">SKU</th>
                <th className="px-3 py-3">Preço</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-4 py-3">Estoque</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="border-t border-zinc-100 align-top">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt="" className="h-10 w-8 rounded object-cover object-top" />
                      <div>
                        <p className="font-medium text-zinc-900">{p.name}</p>
                        <p className="text-[11px] text-zinc-500">{p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-zinc-600">{p.sku || "—"}</td>
                  <td className="px-3 py-3 tabular-nums">{brl(p.promo ?? p.price)}</td>
                  <td className="px-3 py-3">
                    <ProductStatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button type="button" className="grid h-8 w-8 place-items-center rounded-md border border-zinc-200 hover:bg-zinc-50" onClick={() => bump(p, -1)}>
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <input
                        type="number"
                        className={`${field} w-20 text-center ${p.stock <= threshold ? "border-amber-300 bg-amber-50" : ""}`}
                        value={p.stock}
                        onChange={(e) => setStock(p.id, +e.target.value)}
                      />
                      <button type="button" className="grid h-8 w-8 place-items-center rounded-md border border-zinc-200 hover:bg-zinc-50" onClick={() => bump(p, 1)}>
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {p.stockBySize && Object.keys(p.stockBySize).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {p.sizes.map((sz) => (
                          <label key={sz} className="inline-flex items-center gap-1 rounded border border-zinc-200 px-1.5 py-1 text-[10px] text-zinc-500">
                            {sz}
                            <input
                              type="number"
                              className="w-12 rounded border border-zinc-200 px-1 py-0.5 text-center text-xs"
                              value={stockForSize(p, sz)}
                              onChange={(e) => setSizeStock(p, sz, +e.target.value)}
                            />
                          </label>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-14 text-center text-sm text-zinc-500">
                    Nenhum produto neste filtro
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
