import { Download, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { buildCustomers, downloadCsv } from "@/lib/admin-utils";
import { brl, useOrders } from "@/lib/store";
import { EmptyState, PageHeader, Panel, field } from "./shared";

export function CustomersPanel() {
  const [orders] = useOrders();
  const [q, setQ] = useState("");
  const customers = useMemo(() => buildCustomers(orders), [orders]);
  const list = customers.filter((c) => `${c.name} ${c.email} ${c.phone ?? ""} ${c.city ?? ""}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle={`${customers.length} compradores únicos a partir dos pedidos`}
        actions={
          <button
            type="button"
            onClick={() =>
              downloadCsv("clientes-reis-noir.csv", [
                ["Nome", "E-mail", "Telefone", "Cidade", "Pedidos", "Total gasto", "Último pedido"],
                ...list.map((c) => [c.name, c.email, c.phone ?? "", c.city ?? "", String(c.orders), brl(c.total), c.lastOrder]),
              ])
            }
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <Download className="h-3.5 w-3.5" /> Exportar CSV
          </button>
        }
      />

      <Panel className="overflow-hidden">
        <div className="border-b border-zinc-100 px-4 py-3">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input placeholder="Buscar cliente…" value={q} onChange={(e) => setQ(e.target.value)} className={`${field} pl-9`} />
          </div>
        </div>
        {list.length === 0 ? (
          <EmptyState
            title="Nenhum cliente ainda"
            text="Assim que houver pedidos, a base de clientes aparece aqui automaticamente."
            action={
              <span className="inline-flex items-center gap-2 text-xs text-zinc-500">
                <Users className="h-3.5 w-3.5" /> Aguardando primeira venda
              </span>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-zinc-50 text-left text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-3 py-3">Contato</th>
                  <th className="px-3 py-3">Pedidos</th>
                  <th className="px-3 py-3">Total gasto</th>
                  <th className="px-4 py-3">Último pedido</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.email} className="border-t border-zinc-100 hover:bg-zinc-50/80">
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-900">{c.name}</p>
                      {c.city && <p className="text-xs text-zinc-500">{c.city}</p>}
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-zinc-700">{c.email}</p>
                      {c.phone && <p className="text-xs text-zinc-500">{c.phone}</p>}
                    </td>
                    <td className="px-3 py-3 tabular-nums">{c.orders}</td>
                    <td className="px-3 py-3 font-medium tabular-nums">{brl(c.total)}</td>
                    <td className="px-4 py-3 text-zinc-600">{c.lastOrder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
