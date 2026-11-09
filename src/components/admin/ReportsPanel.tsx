import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { downloadCsv, exportOrdersCsv } from "@/lib/admin-utils";
import { brl, paidRevenue, useOrders, useProducts } from "@/lib/store";
import { PageHeader, Panel, field } from "./shared";

type Period = "7" | "30" | "90" | "all";

function inPeriod(date: string, period: Period) {
  if (period === "all") return true;
  const days = Number(period);
  const d = new Date();
  d.setDate(d.getDate() - days);
  return date >= d.toISOString().slice(0, 10);
}

export function ReportsPanel() {
  const [orders] = useOrders();
  const [products] = useProducts();
  const [period, setPeriod] = useState<Period>("30");

  const filtered = useMemo(() => orders.filter((o) => inPeriod(o.date, period)), [orders, period]);
  const paid = filtered.filter((o) => o.status !== "Aguardando pagamento");
  const revenue = paidRevenue(filtered);
  const ticket = paid.length ? revenue / paid.length : 0;
  const awaiting = filtered.filter((o) => o.status === "Aguardando pagamento").length;
  const conversion = filtered.length ? (paid.length / filtered.length) * 100 : 0;

  const previous = useMemo(() => {
    if (period === "all") return [] as typeof orders;
    const days = Number(period);
    const end = new Date();
    end.setDate(end.getDate() - days);
    const start = new Date();
    start.setDate(start.getDate() - days * 2);
    const a = start.toISOString().slice(0, 10);
    const b = end.toISOString().slice(0, 10);
    return orders.filter((o) => o.date >= a && o.date < b);
  }, [orders, period]);
  const prevRevenue = paidRevenue(previous);
  const prevPaid = previous.filter((o) => o.status !== "Aguardando pagamento").length;
  const deltaPct = (now: number, was: number) => {
    if (!was) return now ? 100 : 0;
    return Math.round(((now - was) / was) * 100);
  };
  const revDelta = deltaPct(revenue, prevRevenue);
  const ordDelta = deltaPct(paid.length, prevPaid);

  const byDay = useMemo(() => {
    const map = new Map<string, number>();
    paid.forEach((o) => map.set(o.date, (map.get(o.date) ?? 0) + o.total));
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14)
      .map(([day, receita]) => ({ day: day.slice(5), receita: Math.round(receita * 100) / 100 }));
  }, [paid]);

  const byPayment = useMemo(() => {
    const map: Record<string, number> = {};
    paid.forEach((o) => {
      const key = o.payment ?? "Outro";
      map[key] = (map[key] ?? 0) + o.total;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }));
  }, [paid]);

  const topStock = useMemo(
    () =>
      [...products]
        .sort((a, b) => b.stock - a.stock)
        .slice(0, 8)
        .map((p) => ({ name: p.name.length > 18 ? p.name.slice(0, 18) + "…" : p.name, estoque: p.stock })),
    [products],
  );

  return (
    <div>
      <PageHeader
        title="Relatórios"
        subtitle="Desempenho de vendas e estoque"
        actions={
          <div className="flex flex-wrap gap-2">
            <select className={`${field} w-auto`} value={period} onChange={(e) => setPeriod(e.target.value as Period)}>
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="all">Todo o período</option>
            </select>
            <button
              type="button"
              onClick={() => exportOrdersCsv(filtered)}
              className="inline-flex h-10 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              <Download className="h-3.5 w-3.5" /> Exportar pedidos
            </button>
          </div>
        }
      />

      <div className="space-y-5">
        {period !== "all" && (
          <Panel className="flex flex-wrap items-center gap-4 px-4 py-3 text-sm">
            <p className="text-xs font-medium text-zinc-500 uppercase">vs período anterior</p>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${revDelta >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
              Receita {revDelta >= 0 ? "+" : ""}
              {revDelta}%
            </span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ordDelta >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
              Pedidos {ordDelta >= 0 ? "+" : ""}
              {ordDelta}%
            </span>
            <span className="text-xs text-zinc-500">Anterior: {brl(prevRevenue)} · {prevPaid} pagos</span>
          </Panel>
        )}

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Receita", value: brl(revenue) },
            { label: "Pedidos pagos", value: String(paid.length) },
            { label: "Ticket médio", value: brl(ticket) },
            { label: "Taxa de pagamento", value: `${conversion.toFixed(0)}%` },
          ].map((k) => (
            <Panel key={k.label} className="p-4">
              <p className="text-xs font-medium text-zinc-500">{k.label}</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-900">{k.value}</p>
            </Panel>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel className="p-5">
            <h2 className="text-sm font-semibold text-zinc-900">Receita diária</h2>
            <p className="mb-4 text-xs text-zinc-500">Últimos pontos do período · {awaiting} aguardando pagamento</p>
            <ChartContainer config={{ receita: { label: "Receita", color: "#5c1a22" } }} className="aspect-[16/9] w-full">
              <BarChart data={byDay}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#71717a", fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} width={40} tick={{ fill: "#71717a", fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent formatter={(v) => brl(Number(v))} />} />
                <Bar dataKey="receita" fill="var(--color-receita)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </Panel>

          <Panel className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">Por forma de pagamento</h2>
                <p className="text-xs text-zinc-500">Receita confirmada</p>
              </div>
              <button
                type="button"
                className="text-xs font-medium text-wine hover:underline"
                onClick={() =>
                  downloadCsv(
                    "pagamentos-reis-noir.csv",
                    [["Forma", "Receita"], ...byPayment.map((r) => [r.name, brl(r.value)])],
                  )
                }
              >
                CSV
              </button>
            </div>
            <ul className="space-y-2">
              {byPayment.length === 0 && <li className="text-sm text-zinc-500">Sem dados no período</li>}
              {byPayment.map((r) => (
                <li key={r.name} className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2.5 text-sm">
                  <span className="text-zinc-700">{r.name}</span>
                  <strong className="tabular-nums text-zinc-900">{brl(r.value)}</strong>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel className="p-5">
          <h2 className="text-sm font-semibold text-zinc-900">Estoque disponível (top)</h2>
          <p className="mb-4 text-xs text-zinc-500">Produtos com mais unidades</p>
          <ChartContainer config={{ estoque: { label: "Estoque", color: "#7a2a34" } }} className="aspect-[21/9] w-full">
            <BarChart data={topStock} layout="vertical" margin={{ left: 16, right: 16 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "#71717a", fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={120} tickLine={false} axisLine={false} tick={{ fill: "#71717a", fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="estoque" fill="var(--color-estoque)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        </Panel>
      </div>
    </div>
  );
}
