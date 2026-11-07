import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Copy,
  LayoutDashboard,
  Package,
  Palette,
  Plus,
  ShoppingBag,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { ADMIN_PASSWORD, brl, categories, images, paidRevenue, useOrders, useProducts, useSettings, type Order, type Product } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel administrativo — REIS NOIR" },
      { name: "description", content: "Gerencie produtos, pedidos e conteúdo da loja REIS NOIR." },
      { property: "og:title", content: "Painel — REIS NOIR" },
      { property: "og:description", content: "Painel administrativo REIS NOIR." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const tabs = [
  { id: "Painel", icon: LayoutDashboard },
  { id: "Produtos", icon: Package },
  { id: "Pedidos", icon: ShoppingBag },
  { id: "Aparência", icon: Palette },
] as const;

type TabId = (typeof tabs)[number]["id"];
const input = "h-9 w-full border border-border bg-background px-2 text-sm";

function Admin() {
  const [ok, setOk] = useState(false);
  const [pw, setPw] = useState("");
  const [tab, setTab] = useState<TabId>("Painel");
  useEffect(() => {
    if (sessionStorage.getItem("rn-admin") === "1") setOk(true);
  }, []);

  if (!ok) {
    return (
      <div className="grid min-h-screen place-items-center bg-wine-deep px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (pw === ADMIN_PASSWORD) {
              sessionStorage.setItem("rn-admin", "1");
              setOk(true);
            } else alert("Senha incorreta");
          }}
          className="w-full max-w-sm space-y-4 bg-blush p-8"
        >
          <h1 className="text-center font-display text-3xl text-wine">REIS NOIR · Admin</h1>
          <input type="password" placeholder="Senha" value={pw} onChange={(e) => setPw(e.target.value)} className={input + " h-11"} />
          <button className="h-11 w-full bg-wine text-xs tracking-[0.2em] text-ivory uppercase">Entrar</button>
          <p className="text-center text-xs text-muted-foreground">Senha de demonstração: 1234</p>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f7f5f3] font-sans">
      <aside className="flex w-60 shrink-0 flex-col bg-wine-deep p-5 text-ivory">
        <Link to="/" className="font-display text-2xl text-champagne">
          REIS NOIR
        </Link>
        <p className="mt-1 text-[10px] tracking-[0.2em] text-ivory/40 uppercase">CMS · Loja</p>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {tabs.map(({ id, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-left text-sm transition ${tab === id ? "bg-wine text-ivory" : "text-ivory/65 hover:bg-wine/50 hover:text-ivory"}`}
            >
              <Icon className="h-4 w-4 opacity-80" strokeWidth={1.5} />
              {id}
            </button>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => {
            sessionStorage.removeItem("rn-admin");
            setOk(false);
          }}
          className="px-3 py-2 text-left text-sm text-ivory/45 hover:text-ivory"
        >
          Sair
        </button>
      </aside>
      <main className="min-w-0 flex-1 overflow-auto p-6 md:p-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] tracking-[0.25em] text-muted-foreground uppercase">Painel administrativo</p>
            <h1 className="font-display text-3xl text-wine">{tab}</h1>
          </div>
          <Link to="/" className="text-xs text-wine hover:underline">
            Ver loja ↗
          </Link>
        </div>
        {tab === "Painel" && <Dashboard onGoOrders={() => setTab("Pedidos")} />}
        {tab === "Produtos" && <Products />}
        {tab === "Pedidos" && <Orders />}
        {tab === "Aparência" && <Appearance />}
      </main>
    </div>
  );
}

const revenueConfig = {
  receita: { label: "Receita", color: "oklch(0.27 0.09 12)" },
} satisfies ChartConfig;

const statusConfig = {
  value: { label: "Pedidos" },
} satisfies ChartConfig;

function Dashboard({ onGoOrders }: { onGoOrders: () => void }) {
  const [orders] = useOrders();
  const [products] = useProducts();

  const revenue = paidRevenue(orders);
  const awaiting = orders.filter((o) => o.status === "Aguardando pagamento").length;
  const lowStock = products.filter((p) => p.stock <= 5);
  const ticket = orders.length ? revenue / Math.max(1, orders.filter((o) => o.status !== "Aguardando pagamento").length) : 0;

  const salesByDay = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
      const dayOrders = orders.filter((o) => o.date === key && o.status !== "Aguardando pagamento");
      return {
        day: label,
        receita: Math.round(dayOrders.reduce((a, o) => a + o.total, 0) * 100) / 100,
      };
    });
    return days;
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
      { name: "Aguardando", value: map["Aguardando pagamento"], fill: "oklch(0.75 0.08 70)" },
      { name: "Pago", value: map.Pago, fill: "oklch(0.27 0.09 12)" },
      { name: "Enviado", value: map.Enviado, fill: "oklch(0.45 0.06 20)" },
      { name: "Entregue", value: map.Entregue, fill: "oklch(0.8 0.06 40)" },
    ];
  }, [orders]);

  const categoryBars = useMemo(() => {
    return categories.map((c) => ({
      cat: c.name,
      estoque: products.filter((p) => p.category === c.name).reduce((a, p) => a + p.stock, 0),
    }));
  }, [products]);

  const kpis = [
    { label: "Faturamento líquido", value: brl(revenue), hint: "Pedidos pagos / enviados", icon: TrendingUp },
    { label: "Ticket médio", value: brl(ticket), hint: "Por pedido convertido", icon: ArrowUpRight },
    { label: "Pedidos", value: String(orders.length), hint: `${awaiting} aguardando pagamento`, icon: ShoppingBag },
    { label: "Estoque baixo", value: String(lowStock.length), hint: "≤ 5 unidades", icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, hint, icon: Icon }) => (
          <div key={label} className="border border-border/80 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <p className="text-xs text-muted-foreground">{label}</p>
              <Icon className="h-4 w-4 text-wine/50" strokeWidth={1.5} />
            </div>
            <p className="mt-2 font-display text-2xl text-wine md:text-3xl">{value}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="border border-border/80 bg-white p-5 shadow-sm lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl text-wine">Receita · 7 dias</h2>
              <p className="text-xs text-muted-foreground">Vendas confirmadas por dia</p>
            </div>
          </div>
          <ChartContainer config={revenueConfig} className="aspect-[16/7] w-full">
            <AreaChart data={salesByDay} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="fillReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-receita)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--color-receita)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} width={48} tickFormatter={(v) => `${Math.round(v / 100) / 10}k`} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    indicator="line"
                    formatter={(value) => <span className="font-medium tabular-nums">{brl(Number(value))}</span>}
                  />
                }
              />
              <Area dataKey="receita" type="monotone" fill="url(#fillReceita)" stroke="var(--color-receita)" strokeWidth={2} />
            </AreaChart>
          </ChartContainer>
        </div>

        <div className="border border-border/80 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="font-display text-xl text-wine">Status dos pedidos</h2>
          <p className="mb-2 text-xs text-muted-foreground">Distribuição atual do funil</p>
          <ChartContainer config={statusConfig} className="mx-auto aspect-square max-h-[240px]">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={52} outerRadius={84} paddingAngle={3}>
                {byStatus.map((s) => (
                  <Cell key={s.name} fill={s.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          <ul className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {byStatus.map((s) => (
              <li key={s.name} className="flex items-center gap-2">
                <span className="h-2 w-2 shrink-0" style={{ background: s.fill }} />
                {s.name}: <strong>{s.value}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="border border-border/80 bg-white p-5 shadow-sm">
          <h2 className="font-display text-xl text-wine">Estoque por categoria</h2>
          <p className="mb-4 text-xs text-muted-foreground">Unidades disponíveis no catálogo</p>
          <ChartContainer config={{ estoque: { label: "Estoque", color: "oklch(0.45 0.06 20)" } }} className="aspect-[16/9] w-full">
            <BarChart data={categoryBars} margin={{ left: 0, right: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="cat" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} width={28} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="estoque" fill="var(--color-estoque)" radius={0} />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="border border-border/80 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl text-wine">Pedidos recentes</h2>
              <p className="text-xs text-muted-foreground">Últimas movimentações</p>
            </div>
            <button type="button" onClick={onGoOrders} className="text-xs text-wine hover:underline">
              Ver todos
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[11px] text-muted-foreground">
                <tr>
                  <th className="pb-2 font-medium">Pedido</th>
                  <th className="pb-2 font-medium">Cliente</th>
                  <th className="pb-2 font-medium">Total</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 6).map((o) => (
                  <tr key={o.id} className="border-t border-border/70">
                    <td className="py-2.5 font-medium">{o.id}</td>
                    <td className="py-2.5">{o.customer}</td>
                    <td className="py-2.5">{brl(o.total)}</td>
                    <td className="py-2.5">
                      <StatusPill status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {lowStock.length > 0 && (
            <div className="mt-4 border border-wine/20 bg-blush/60 p-3 text-xs text-wine">
              <p className="font-medium">Atenção ao estoque</p>
              <p className="mt-1 text-wine/80">{lowStock.map((p) => `${p.name} (${p.stock})`).join(" · ")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: Order["status"] }) {
  const styles: Record<Order["status"], string> = {
    "Aguardando pagamento": "bg-amber-100 text-amber-900",
    Pago: "bg-wine/10 text-wine",
    Enviado: "bg-sky-100 text-sky-900",
    Entregue: "bg-emerald-100 text-emerald-900",
  };
  return <span className={`inline-block px-2 py-0.5 text-[10px] ${styles[status]}`}>{status}</span>;
}

function Products() {
  const [products, setProducts] = useProducts();
  const [q, setQ] = useState("");
  const upd = (id: string, patch: Partial<Product>) => setProducts(products.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const add = () => {
    const id = String(Date.now());
    setProducts([
      ...products,
      {
        id,
        slug: `novo-produto-${id}`,
        name: "Novo produto",
        category: "Vestidos",
        price: 399.9,
        stock: 0,
        image: images.vestidos,
        description: "",
        sizes: ["PP", "P", "M", "G"],
        status: "rascunho",
      },
    ]);
  };
  return (
    <div className="border border-border/80 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap gap-3">
        <input placeholder="Pesquisar produtos..." value={q} onChange={(e) => setQ(e.target.value)} className={input + " max-w-xs"} />
        <button type="button" onClick={add} className="flex items-center gap-2 bg-wine px-4 text-sm text-ivory">
          <Plus className="h-4 w-4" /> Novo produto
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted-foreground">
            <tr>
              <th className="p-2"></th>
              <th className="p-2">Nome</th>
              <th className="p-2">Categoria</th>
              <th className="p-2">Preço</th>
              <th className="p-2">Promo</th>
              <th className="p-2">Estoque</th>
              <th className="p-2">Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products
              .filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
              .map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="p-2">
                    <img src={p.image} alt="" className="h-12 w-9 object-cover object-[78%_0%]" />
                  </td>
                  <td className="p-2">
                    <input className={input} value={p.name} onChange={(e) => upd(p.id, { name: e.target.value })} />
                  </td>
                  <td className="p-2">
                    <select
                      className={input}
                      value={p.category}
                      onChange={(e) => {
                        const c = categories.find((x) => x.name === e.target.value)!;
                        upd(p.id, { category: c.name, image: c.image });
                      }}
                    >
                      {categories.map((c) => (
                        <option key={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <input type="number" className={input + " w-24"} value={p.price} onChange={(e) => upd(p.id, { price: +e.target.value })} />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      className={input + " w-24"}
                      value={p.promo ?? ""}
                      onChange={(e) => upd(p.id, { promo: e.target.value ? +e.target.value : undefined })}
                    />
                  </td>
                  <td className="p-2">
                    <input type="number" className={input + " w-20"} value={p.stock} onChange={(e) => upd(p.id, { stock: +e.target.value })} />
                  </td>
                  <td className="p-2">
                    <select className={input} value={p.status} onChange={(e) => upd(p.id, { status: e.target.value as Product["status"] })}>
                      <option>publicado</option>
                      <option>rascunho</option>
                    </select>
                  </td>
                  <td className="flex gap-2 p-2 pt-5">
                    <button
                      type="button"
                      aria-label="Duplicar"
                      onClick={() =>
                        setProducts([
                          ...products,
                          { ...p, id: String(Date.now()), slug: p.slug + "-copia", name: p.name + " (cópia)", status: "rascunho" },
                        ])
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button type="button" aria-label="Excluir" onClick={() => confirm("Excluir produto?") && setProducts(products.filter((x) => x.id !== p.id))}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Orders() {
  const [orders, setOrders] = useOrders();
  const st: Order["status"][] = ["Aguardando pagamento", "Pago", "Enviado", "Entregue"];
  return (
    <div className="overflow-x-auto border border-border/80 bg-white p-5 shadow-sm">
      <table className="w-full text-sm">
        <thead className="text-left text-xs text-muted-foreground">
          <tr>
            <th className="p-2">Pedido</th>
            <th className="p-2">Cliente</th>
            <th className="p-2">Data</th>
            <th className="p-2">Pagamento</th>
            <th className="p-2">Itens</th>
            <th className="p-2">Total</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t border-border">
              <td className="p-2 font-medium">{o.id}</td>
              <td className="p-2">
                {o.customer}
                <br />
                <span className="text-xs text-muted-foreground">{o.email}</span>
                {o.city && (
                  <>
                    <br />
                    <span className="text-xs text-muted-foreground">{o.city}</span>
                  </>
                )}
              </td>
              <td className="p-2">{o.date}</td>
              <td className="p-2">{o.payment ?? "—"}</td>
              <td className="p-2">{o.items}</td>
              <td className="p-2">{brl(o.total)}</td>
              <td className="p-2">
                <select
                  className={input}
                  value={o.status}
                  onChange={(e) => setOrders(orders.map((x) => (x.id === o.id ? { ...x, status: e.target.value as Order["status"] } : x)))}
                >
                  {st.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Appearance() {
  const [s, setS] = useSettings();
  const set = <K extends keyof typeof s>(k: K, v: (typeof s)[K]) => setS({ ...s, [k]: v });
  const field = (k: keyof typeof s, label: string, multiline = false) => (
    <label className="block text-sm">
      {label}
      {multiline ? (
        <textarea className={input + " mt-1 min-h-20 py-2"} value={String(s[k])} onChange={(e) => set(k, e.target.value as never)} />
      ) : (
        <input className={input + " mt-1"} value={String(s[k])} onChange={(e) => set(k, e.target.value as never)} />
      )}
    </label>
  );
  const box = "border border-border/80 bg-white p-5 shadow-sm space-y-4";
  const h = "font-display text-xl text-wine";

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <p className="text-sm text-muted-foreground">Edite os textos de cada seção da loja. As alterações aparecem na hora.</p>

      <section className={box}>
        <h2 className={h}>Barra promocional</h2>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={s.promoActive} onChange={(e) => set("promoActive", e.target.checked)} /> Ativa
        </label>
        {field("promoText", "Texto")}
      </section>

      <section className={box}>
        <h2 className={h}>Banner principal (slide 1)</h2>
        {field("heroKicker", "Linha superior")}
        {field("heroTitle", "Título", true)}
        {field("heroAccent", "Palavra em destaque")}
        {field("heroButton", "Texto do botão")}
      </section>

      <section className={box}>
        <h2 className={h}>Slides do carrossel</h2>
        {s.slides.map((slide, idx) => (
          <div key={idx} className="space-y-3 border border-border/60 p-4">
            <p className="text-xs tracking-wider text-muted-foreground uppercase">Slide {idx + 2}</p>
            {(
              [
                ["kicker", "Linha superior"],
                ["title", "Título"],
                ["accent", "Destaque"],
                ["text", "Texto de apoio"],
                ["button", "Botão"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block text-sm">
                {label}
                <input
                  className={input + " mt-1"}
                  value={slide[key]}
                  onChange={(e) => {
                    const slides = s.slides.map((sl, i) => (i === idx ? { ...sl, [key]: e.target.value } : sl));
                    set("slides", slides);
                  }}
                />
              </label>
            ))}
          </div>
        ))}
      </section>

      <section className={box}>
        <h2 className={h}>Benefícios</h2>
        {s.benefits.map((b, idx) => (
          <div key={idx} className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              Título {idx + 1}
              <input
                className={input + " mt-1"}
                value={b.title}
                onChange={(e) => {
                  const benefits = s.benefits.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x));
                  set("benefits", benefits);
                }}
              />
            </label>
            <label className="block text-sm">
              Subtítulo {idx + 1}
              <input
                className={input + " mt-1"}
                value={b.subtitle}
                onChange={(e) => {
                  const benefits = s.benefits.map((x, i) => (i === idx ? { ...x, subtitle: e.target.value } : x));
                  set("benefits", benefits);
                }}
              />
            </label>
          </div>
        ))}
      </section>

      <section className={box}>
        <h2 className={h}>Coleções</h2>
        {field("collectionsEyebrow", "Linha superior")}
        {field("collectionsTitle", "Título")}
      </section>

      <section className={box}>
        <h2 className={h}>Vitrine de produtos</h2>
        {field("productsTitle", "Título da seção")}
      </section>

      <section className={box}>
        <h2 className={h}>Faixa institucional</h2>
        {field("editorialTitle", "Frase", true)}
        {field("editorialKicker", "Linha inferior")}
        {field("editorialButton", "Texto do botão")}
      </section>

      <section className={box}>
        <h2 className={h}>Rodapé</h2>
        {field("footerAbout", "Texto da marca", true)}
        {field("footerWhatsappLabel", "WhatsApp (exibição)")}
        {field("footerWhatsappNumber", "WhatsApp (número com DDI, só dígitos)")}
        {field("footerInstagram", "Instagram (sem @)")}
        {field("footerPoliciesTitle", "Título políticas")}
        {field("footerPolicy1", "Política 1")}
        {field("footerPolicy2", "Política 2")}
        {field("footerPolicy3", "Política 3")}
        {field("footerPaymentTitle", "Título pagamento")}
        {field("footerPaymentText", "Formas de pagamento")}
        {field("footerCopyright", "Copyright")}
      </section>
    </div>
  );
}
