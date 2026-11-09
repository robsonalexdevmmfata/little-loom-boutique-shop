import { AlertTriangle, ArrowUpRight, CheckCircle2, Download, Package, ShoppingBag, TicketPercent, TrendingUp, Users } from "lucide-react";
import { useMemo } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { exportOrdersCsv } from "@/lib/admin-utils";
import { brl, categories, paidRevenue, useCommerce, useCoupons, useOrders, useProducts, type Order } from "@/lib/store";
import { OnboardingTour } from "./OnboardingTour";
import { PageHeader, Panel, StatusPill } from "./shared";

const revenueConfig = {
  receita: { label: "Receita", color: "#5c1a22" },
} satisfies ChartConfig;

export type AdminGo =
  | "Painel"
  | "Produtos"
  | "Estoque"
  | "Mídia"
  | "Pedidos"
  | "Clientes"
  | "Cupons"
  | "Relatórios"
  | "Aparência"
  | "Políticas"
  | "FAQ"
  | "SEO"
  | "Avaliações"
  | "Newsletter"
  | "Popup"
  | "Sacolas"
  | "Usuários"
  | "Histórico"
  | "Analytics"
  | "Meta Ads"
  | "Integrações"
  | "Configurações";

export function DashboardPanel({ onGo }: { onGo: (t: AdminGo) => void }) {
  const [orders] = useOrders();
  const [products] = useProducts();
  const [coupons] = useCoupons();
  const [commerce] = useCommerce();
  const revenue = paidRevenue(orders);
  const awaiting = orders.filter((o) => o.status === "Aguardando pagamento").length;
  const threshold = commerce.lowStockThreshold;
  const lowStock = products.filter((p) => p.stock <= threshold);
  const published = products.filter((p) => p.status === "publicado").length;
  const paidCount = orders.filter((o) => o.status !== "Aguardando pagamento").length;
  const ticket = paidCount ? revenue / paidCount : 0;
  const uniqueCustomers = new Set(orders.map((o) => o.email.toLowerCase())).size;
  const activeCoupons = coupons.filter((c) => c.active).length;

  const checklist = [
    { ok: published > 0, label: "Publicar ao menos 1 produto", go: "Produtos" as const },
    { ok: products.some((p) => p.showInVitrine !== false), label: "Definir produtos na vitrine", go: "Produtos" as const },
    { ok: activeCoupons > 0, label: "Criar cupom de desconto", go: "Cupons" as const },
    { ok: commerce.freeShippingFrom > 0, label: "Configurar frete grátis", go: "Configurações" as const },
    { ok: orders.length > 0, label: "Receber o primeiro pedido", go: "Pedidos" as const },
  ];
  const checklistDone = checklist.filter((c) => c.ok).length;

  const salesByDay = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
      const dayOrders = orders.filter((o) => o.date === key && o.status !== "Aguardando pagamento");
      return { day: label, receita: Math.round(dayOrders.reduce((a, o) => a + o.total, 0) * 100) / 100 };
    });
  }, [orders]);

  const byStatus = useMemo(() => {
    const map: Record<Order["status"], number> = {
      "Aguardando pagamento": 0,
      Pago: 0,
      Enviado: 0,
      Entregue: 0,
    };
    orders.forEach((o) => {
      map[o.status] += 1;
    });
    return [
      { name: "Aguardando", value: map["Aguardando pagamento"], fill: "#f59e0b" },
      { name: "Pago", value: map.Pago, fill: "#5c1a22" },
      { name: "Enviado", value: map.Enviado, fill: "#0284c7" },
      { name: "Entregue", value: map.Entregue, fill: "#059669" },
    ];
  }, [orders]);

  const categoryBars = useMemo(
    () => categories.map((c) => ({ cat: c.name, estoque: products.filter((p) => p.category === c.name).reduce((a, p) => a + p.stock, 0) })),
    [products],
  );

  const kpis = [
    { label: "Faturamento", value: brl(revenue), hint: "Pedidos pagos", icon: TrendingUp },
    { label: "Ticket médio", value: brl(ticket), hint: "Por pedido pago", icon: ArrowUpRight },
    { label: "Pedidos", value: String(orders.length), hint: `${awaiting} aguardando`, icon: ShoppingBag },
    { label: "Clientes", value: String(uniqueCustomers), hint: `${published} produtos · ${activeCoupons} cupons`, icon: Users },
  ];

  const activity = useMemo(() => {
    const rows: { id: string; text: string; when: string; go: AdminGo }[] = [];
    orders.slice(0, 5).forEach((o) => {
      rows.push({ id: `ord-${o.id}`, text: `Pedido ${o.id} · ${o.customer} · ${o.status}`, when: o.date, go: "Pedidos" });
    });
    lowStock.slice(0, 3).forEach((p) => {
      rows.push({ id: `stk-${p.id}`, text: `Estoque baixo: ${p.name} (${p.stock})`, when: "agora", go: "Estoque" });
    });
    return rows.slice(0, 8);
  }, [orders, lowStock]);

  return (
    <div>
      <PageHeader
        title="Painel"
        subtitle={`Visão geral · ${commerce.storeName}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                exportOrdersCsv(orders);
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              <Download className="h-3.5 w-3.5" /> Exportar vendas
            </button>
            <button type="button" onClick={() => onGo("Pedidos")} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-wine px-3 text-xs font-medium text-ivory hover:bg-wine-deep">
              <ShoppingBag className="h-3.5 w-3.5" /> Pedidos
            </button>
          </div>
        }
      />

      <OnboardingTour onGo={onGo} />

      <div className="space-y-5">
        {checklistDone < checklist.length && (
          <Panel className="p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">Checklist de loja pronta</h2>
                <p className="text-xs text-zinc-500">
                  {checklistDone}/{checklist.length} concluídos — complete para operar como e-commerce profissional
                </p>
              </div>
              <div className="h-2 w-36 overflow-hidden rounded-full bg-zinc-100">
                <div className="h-full rounded-full bg-wine transition-all" style={{ width: `${(checklistDone / checklist.length) * 100}%` }} />
              </div>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {checklist.map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => onGo(item.go)}
                    className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                      item.ok ? "border-emerald-200 bg-emerald-50/60 text-emerald-800" : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-wine/30"
                    }`}
                  >
                    {item.ok ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <span className="grid h-4 w-4 place-items-center rounded-full border border-zinc-300 text-[10px]">•</span>}
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map(({ label, value, hint, icon: Icon }) => (
            <Panel key={label} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-zinc-500">{label}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-zinc-900">{value}</p>
                  <p className="mt-1 text-[11px] text-zinc-500">{hint}</p>
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-zinc-100 text-zinc-600">
                  <Icon className="h-4 w-4" strokeWidth={1.6} />
                </span>
              </div>
            </Panel>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <button type="button" onClick={() => onGo("Produtos")} className="rounded-xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition hover:border-wine/30">
            <Package className="h-4 w-4 text-wine" />
            <p className="mt-2 text-sm font-semibold">Catálogo</p>
            <p className="text-xs text-zinc-500">{products.length} produtos · {lowStock.length} estoque baixo</p>
          </button>
          <button type="button" onClick={() => onGo("Cupons")} className="rounded-xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition hover:border-wine/30">
            <TicketPercent className="h-4 w-4 text-wine" />
            <p className="mt-2 text-sm font-semibold">Cupons</p>
            <p className="text-xs text-zinc-500">{activeCoupons} ativos de {coupons.length}</p>
          </button>
          <button type="button" onClick={() => onGo("Clientes")} className="rounded-xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition hover:border-wine/30">
            <Users className="h-4 w-4 text-wine" />
            <p className="mt-2 text-sm font-semibold">Base de clientes</p>
            <p className="text-xs text-zinc-500">{uniqueCustomers} compradores</p>
          </button>
          <button type="button" onClick={() => onGo("Relatórios")} className="rounded-xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition hover:border-wine/30">
            <TrendingUp className="h-4 w-4 text-wine" />
            <p className="mt-2 text-sm font-semibold">Relatórios</p>
            <p className="text-xs text-zinc-500">Receita e pagamentos</p>
          </button>
          <button type="button" onClick={() => onGo("Meta Ads")} className="rounded-xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition hover:border-wine/30">
            <TicketPercent className="h-4 w-4 text-wine" />
            <p className="mt-2 text-sm font-semibold">Meta Ads</p>
            <p className="text-xs text-zinc-500">Facebook e Instagram</p>
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          <Panel className="p-5 lg:col-span-3">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-zinc-900">Receita · 7 dias</h2>
              <p className="text-xs text-zinc-500">Vendas confirmadas por dia</p>
            </div>
            <ChartContainer config={revenueConfig} className="aspect-[16/7] w-full">
              <AreaChart data={salesByDay} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-receita)" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="var(--color-receita)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} tick={{ fill: "#71717a", fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} width={48} tick={{ fill: "#71717a", fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 100) / 10}k`} />
                <ChartTooltip content={<ChartTooltipContent indicator="line" formatter={(value) => <span className="font-medium tabular-nums">{brl(Number(value))}</span>} />} />
                <Area dataKey="receita" type="monotone" fill="url(#fillReceita)" stroke="var(--color-receita)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </Panel>

          <Panel className="p-5 lg:col-span-2">
            <div className="mb-2">
              <h2 className="text-sm font-semibold text-zinc-900">Status dos pedidos</h2>
              <p className="text-xs text-zinc-500">Distribuição atual</p>
            </div>
            <ChartContainer config={{ value: { label: "Pedidos" } }} className="mx-auto aspect-square max-h-[220px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={3}>
                  {byStatus.map((s) => (
                    <Cell key={s.name} fill={s.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <ul className="mt-1 grid grid-cols-2 gap-2 text-xs">
              {byStatus.map((s) => (
                <li key={s.name} className="flex items-center gap-2 text-zinc-600">
                  <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: s.fill }} />
                  {s.name}: <strong className="text-zinc-900">{s.value}</strong>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel className="p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-zinc-900">Estoque por categoria</h2>
              <p className="text-xs text-zinc-500">Unidades disponíveis</p>
            </div>
            <ChartContainer config={{ estoque: { label: "Estoque", color: "#7a2a34" } }} className="aspect-[16/9] w-full">
              <BarChart data={categoryBars} margin={{ left: 0, right: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="cat" tickLine={false} axisLine={false} tickMargin={8} tick={{ fill: "#71717a", fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} width={28} tick={{ fill: "#71717a", fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="estoque" fill="var(--color-estoque)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </Panel>

          <Panel className="overflow-hidden">
            <div className="border-b border-zinc-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-zinc-900">Atividade recente</h2>
              <p className="text-xs text-zinc-500">Pedidos e alertas de estoque</p>
              <ul className="mt-3 space-y-2">
                {activity.map((a) => (
                  <li key={a.id}>
                    <button type="button" onClick={() => onGo(a.go)} className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-zinc-50">
                      <span className="truncate text-zinc-700">{a.text}</span>
                      <span className="shrink-0 text-zinc-400">{a.when}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">Pedidos recentes</h2>
                <p className="text-xs text-zinc-500">Últimas movimentações</p>
              </div>
              <button type="button" onClick={() => onGo("Pedidos")} className="text-xs font-medium text-wine hover:underline">
                Ver todos
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 text-left text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
                  <tr>
                    <th className="px-5 py-2.5">Pedido</th>
                    <th className="px-3 py-2.5">Cliente</th>
                    <th className="px-3 py-2.5">Total</th>
                    <th className="px-5 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 6).map((o) => (
                    <tr key={o.id} className="border-t border-zinc-100">
                      <td className="px-5 py-3 font-medium">{o.id}</td>
                      <td className="px-3 py-3 text-zinc-600">{o.customer}</td>
                      <td className="px-3 py-3 tabular-nums">{brl(o.total)}</td>
                      <td className="px-5 py-3">
                        <StatusPill status={o.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {lowStock.length > 0 && (
              <div className="flex gap-2 border-t border-amber-100 bg-amber-50 px-5 py-3 text-xs text-amber-900">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <div>
                  <p className="font-medium">Estoque baixo (≤ {threshold})</p>
                  <p className="mt-0.5 text-amber-800/80">{lowStock.map((p) => `${p.name} (${p.stock})`).join(" · ")}</p>
                </div>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
