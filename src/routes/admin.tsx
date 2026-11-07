import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  Copy,
  Crown,
  ExternalLink,
  Eye,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Package,
  Palette,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Switch } from "@/components/ui/switch";
import {
  ADMIN_PASSWORD,
  brl,
  categories,
  images,
  paidRevenue,
  useCatalog,
  useOrders,
  useProducts,
  useSettings,
  type CatalogCategory,
  type Order,
  type Product,
  type Settings,
} from "@/lib/store";

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
  { id: "Painel", icon: LayoutDashboard, desc: "Visão geral" },
  { id: "Produtos", icon: Package, desc: "Catálogo" },
  { id: "Pedidos", icon: ShoppingBag, desc: "Vendas" },
  { id: "Aparência", icon: Palette, desc: "Conteúdo da loja" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const fieldClass =
  "h-11 w-full border border-[#e8e0da] bg-[#fbfaf8] px-3 text-sm text-foreground outline-none transition focus:border-wine focus:bg-white focus:ring-2 focus:ring-wine/10";
const areaClass =
  "min-h-[88px] w-full border border-[#e8e0da] bg-[#fbfaf8] px-3 py-2.5 text-sm outline-none transition focus:border-wine focus:bg-white focus:ring-2 focus:ring-wine/10";

function Admin() {
  const [ok, setOk] = useState(false);
  const [pw, setPw] = useState("");
  const [tab, setTab] = useState<TabId>("Painel");
  const [err, setErr] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem("rn-admin") === "1") setOk(true);
  }, []);

  if (!ok) {
    return (
      <div className="relative grid min-h-screen place-items-center overflow-hidden bg-wine-deep px-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(217,195,165,0.18),_transparent_55%)]" />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (pw === ADMIN_PASSWORD) {
              sessionStorage.setItem("rn-admin", "1");
              setOk(true);
              setErr(false);
            } else {
              setErr(true);
              toast.error("Senha incorreta");
            }
          }}
          className="relative w-full max-w-md border border-ivory/10 bg-wine/40 p-8 shadow-2xl backdrop-blur-md sm:p-10"
        >
          <div className="mb-8 flex flex-col items-center text-center">
            <Crown className="h-7 w-7 text-champagne" strokeWidth={1.2} />
            <h1 className="mt-3 font-display text-3xl text-ivory">REIS NOIR</h1>
            <p className="mt-1 text-[11px] tracking-[0.35em] text-ivory/50 uppercase">Console da loja</p>
          </div>
          <label className="block text-xs tracking-wide text-ivory/70">
            Senha de acesso
            <input
              type="password"
              value={pw}
              onChange={(e) => {
                setPw(e.target.value);
                setErr(false);
              }}
              className={`mt-2 h-12 w-full border bg-wine-deep/60 px-3 text-ivory outline-none placeholder:text-ivory/30 focus:border-champagne ${err ? "border-red-400/60" : "border-ivory/15"}`}
              placeholder="••••"
              autoFocus
            />
          </label>
          <button type="submit" className="mt-6 h-12 w-full bg-champagne text-[11px] tracking-[0.25em] text-wine-deep uppercase transition hover:bg-ivory">
            Entrar no painel
          </button>
          <p className="mt-4 text-center text-[11px] text-ivory/40">Demo · senha 1234</p>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f3efe9] font-sans text-foreground">
      <aside className="sticky top-0 flex h-screen w-[248px] shrink-0 flex-col border-r border-wine/20 bg-wine-deep text-ivory">
        <div className="border-b border-ivory/10 px-5 py-5">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center border border-champagne/40 text-champagne">
              <Crown className="h-4 w-4" strokeWidth={1.3} />
            </span>
            <span>
              <span className="block font-display text-xl leading-none text-champagne">REIS NOIR</span>
              <span className="mt-1 block text-[10px] tracking-[0.28em] text-ivory/40 uppercase">Commerce OS</span>
            </span>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {tabs.map(({ id, icon: Icon, desc }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`group flex items-center gap-3 px-3 py-3 text-left transition ${active ? "bg-champagne/15 text-champagne" : "text-ivory/65 hover:bg-ivory/5 hover:text-ivory"}`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-champagne" : "opacity-70"}`} strokeWidth={1.5} />
                <span>
                  <span className="block text-sm font-medium">{id}</span>
                  <span className={`block text-[10px] ${active ? "text-champagne/70" : "text-ivory/35"}`}>{desc}</span>
                </span>
              </button>
            );
          })}
        </nav>
        <div className="border-t border-ivory/10 p-4">
          <div className="mb-3 flex items-center gap-2 px-1 text-[11px] text-ivory/50">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Loja online
          </div>
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem("rn-admin");
              setOk(false);
            }}
            className="flex w-full items-center gap-2 px-2 py-2 text-sm text-ivory/45 transition hover:text-ivory"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#e5ddd4] bg-[#f3efe9]/90 px-6 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Store className="h-3.5 w-3.5" />
            <span>reisnoir</span>
            <span className="text-[#d4c8bc]">/</span>
            <span className="font-medium text-wine">{tab}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 text-[11px] text-muted-foreground sm:flex">
              <Sparkles className="h-3 w-3 text-champagne" />
              Salvamento automático
            </span>
            <Link
              to="/"
              className="inline-flex h-9 items-center gap-2 border border-wine/20 bg-white px-3 text-xs text-wine transition hover:border-wine hover:bg-wine hover:text-ivory"
            >
              Ver loja <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-auto p-5 md:p-8">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] tracking-[0.28em] text-muted-foreground uppercase">Painel administrativo</p>
              <h1 className="mt-1 font-display text-3xl text-wine md:text-4xl">{tab}</h1>
            </div>
          </div>
          {tab === "Painel" && <Dashboard onGoOrders={() => setTab("Pedidos")} />}
          {tab === "Produtos" && <Products />}
          {tab === "Pedidos" && <Orders />}
          {tab === "Aparência" && <Appearance />}
        </main>
      </div>
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
      { name: "Aguardando", value: map["Aguardando pagamento"], fill: "oklch(0.75 0.08 70)" },
      { name: "Pago", value: map.Pago, fill: "oklch(0.27 0.09 12)" },
      { name: "Enviado", value: map.Enviado, fill: "oklch(0.45 0.06 20)" },
      { name: "Entregue", value: map.Entregue, fill: "oklch(0.8 0.06 40)" },
    ];
  }, [orders]);

  const categoryBars = useMemo(
    () => categories.map((c) => ({ cat: c.name, estoque: products.filter((p) => p.category === c.name).reduce((a, p) => a + p.stock, 0) })),
    [products],
  );

  const kpis = [
    { label: "Faturamento líquido", value: brl(revenue), hint: "Pedidos convertidos", icon: TrendingUp },
    { label: "Ticket médio", value: brl(ticket), hint: "Por pedido pago", icon: ArrowUpRight },
    { label: "Pedidos", value: String(orders.length), hint: `${awaiting} aguardando`, icon: ShoppingBag },
    { label: "Estoque baixo", value: String(lowStock.length), hint: "≤ 5 unidades", icon: AlertTriangle },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, hint, icon: Icon }) => (
          <div key={label} className="relative overflow-hidden border border-[#e5ddd4] bg-white p-5 shadow-[0_1px_0_rgba(61,20,24,0.04)]">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-wine/[0.03]" />
            <div className="flex items-start justify-between">
              <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{label}</p>
              <span className="grid h-8 w-8 place-items-center bg-blush text-wine">
                <Icon className="h-4 w-4" strokeWidth={1.5} />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl text-wine">{value}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="border border-[#e5ddd4] bg-white p-5 shadow-[0_1px_0_rgba(61,20,24,0.04)] lg:col-span-3">
          <h2 className="font-display text-xl text-wine">Receita · 7 dias</h2>
          <p className="mb-4 text-xs text-muted-foreground">Vendas confirmadas por dia</p>
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
              <ChartTooltip content={<ChartTooltipContent indicator="line" formatter={(value) => <span className="font-medium tabular-nums">{brl(Number(value))}</span>} />} />
              <Area dataKey="receita" type="monotone" fill="url(#fillReceita)" stroke="var(--color-receita)" strokeWidth={2} />
            </AreaChart>
          </ChartContainer>
        </div>
        <div className="border border-[#e5ddd4] bg-white p-5 shadow-[0_1px_0_rgba(61,20,24,0.04)] lg:col-span-2">
          <h2 className="font-display text-xl text-wine">Status dos pedidos</h2>
          <p className="mb-2 text-xs text-muted-foreground">Funil atual</p>
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
        <div className="border border-[#e5ddd4] bg-white p-5 shadow-[0_1px_0_rgba(61,20,24,0.04)]">
          <h2 className="font-display text-xl text-wine">Estoque por categoria</h2>
          <p className="mb-4 text-xs text-muted-foreground">Unidades no catálogo</p>
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
        <div className="border border-[#e5ddd4] bg-white p-5 shadow-[0_1px_0_rgba(61,20,24,0.04)]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl text-wine">Pedidos recentes</h2>
              <p className="text-xs text-muted-foreground">Últimas movimentações</p>
            </div>
            <button type="button" onClick={onGoOrders} className="text-xs text-wine hover:underline">
              Ver todos
            </button>
          </div>
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
                <tr key={o.id} className="border-t border-[#eee7e0]">
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
          {lowStock.length > 0 && (
            <div className="mt-4 flex gap-2 border border-wine/15 bg-blush/70 p-3 text-xs text-wine">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <div>
                <p className="font-medium">Atenção ao estoque</p>
                <p className="mt-0.5 text-wine/80">{lowStock.map((p) => `${p.name} (${p.stock})`).join(" · ")}</p>
              </div>
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
  return <span className={`inline-block px-2 py-0.5 text-[10px] tracking-wide ${styles[status]}`}>{status}</span>;
}

function PlacementToggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3 border border-[#eee7e0] bg-[#faf7f4]/70 px-3 py-2.5">
      <span>
        <span className="block text-xs font-medium text-wine">{label}</span>
        <span className="block text-[10px] text-muted-foreground">{hint}</span>
      </span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

function Products() {
  const [products, setProducts] = useProducts();
  const [catalog, setCatalog] = useCatalog();
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [newSub, setNewSub] = useState<Record<string, string>>({});

  const upd = (id: string, patch: Partial<Product>) => setProducts(products.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const add = () => {
    const id = String(Date.now());
    const cat = catalog[0];
    setProducts([
      ...products,
      {
        id,
        slug: `novo-produto-${id}`,
        name: "Novo produto",
        category: cat?.name ?? "Vestidos",
        subcategory: cat?.subcategories[0] ?? "",
        price: 399.9,
        stock: 0,
        image: cat?.image ?? images.vestidos,
        description: "",
        sizes: ["PP", "P", "M", "G"],
        showInVitrine: true,
        featured: false,
        isNew: true,
        best: false,
        status: "rascunho",
      },
    ]);
    setOpenId(id);
    toast.success("Produto criado — defina vitrine e subcategoria");
  };

  const addSubcategory = (catName: string) => {
    const name = (newSub[catName] ?? "").trim();
    if (!name) return;
    setCatalog(
      catalog.map((c) =>
        c.name === catName && !c.subcategories.includes(name) ? { ...c, subcategories: [...c.subcategories, name] } : c,
      ),
    );
    setNewSub((s) => ({ ...s, [catName]: "" }));
    toast.success(`Subcategoria “${name}” criada`);
  };

  const removeSubcategory = (catName: string, sub: string) => {
    setCatalog(catalog.map((c) => (c.name === catName ? { ...c, subcategories: c.subcategories.filter((x) => x !== sub) } : c)));
    setProducts(products.map((p) => (p.category === catName && p.subcategory === sub ? { ...p, subcategory: "" } : p)));
  };

  const list = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  const subsOf = (cat: string) => catalog.find((c) => c.name === cat)?.subcategories ?? [];

  return (
    <div className="space-y-5">
      <div className="border border-[#e5ddd4] bg-white p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-wine">Categorias & subcategorias</h2>
            <p className="text-xs text-muted-foreground">Crie subcategorias para organizar o catálogo da loja.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {catalog.map((c: CatalogCategory) => (
            <div key={c.name} className="border border-[#eee7e0] p-4">
              <div className="mb-3 flex items-center gap-3">
                <img src={c.image} alt="" className="h-12 w-9 object-cover object-top" />
                <div>
                  <p className="font-medium text-wine">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground">{c.subcategories.length} subcategorias</p>
                </div>
              </div>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {c.subcategories.length === 0 && <span className="text-xs text-muted-foreground">Nenhuma ainda</span>}
                {c.subcategories.map((sub) => (
                  <span key={sub} className="inline-flex items-center gap-1 border border-wine/15 bg-blush/50 px-2 py-1 text-[11px] text-wine">
                    {sub}
                    <button type="button" aria-label={`Remover ${sub}`} className="opacity-50 hover:opacity-100" onClick={() => removeSubcategory(c.name, sub)}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className={fieldClass}
                  placeholder="Nova subcategoria…"
                  value={newSub[c.name] ?? ""}
                  onChange={(e) => setNewSub((s) => ({ ...s, [c.name]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSubcategory(c.name))}
                />
                <button type="button" onClick={() => addSubcategory(c.name)} className="h-11 shrink-0 bg-wine px-3 text-xs tracking-wider text-ivory uppercase">
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border border-[#e5ddd4] bg-white p-4">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input placeholder="Buscar no catálogo…" value={q} onChange={(e) => setQ(e.target.value)} className={fieldClass + " pl-9"} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{list.length} produtos</span>
          <button type="button" onClick={add} className="inline-flex h-11 items-center gap-2 bg-wine px-4 text-xs tracking-wider text-ivory uppercase">
            <Plus className="h-4 w-4" /> Novo produto
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {list.map((p) => {
          const open = openId === p.id;
          const subs = subsOf(p.category);
          return (
            <div key={p.id} className="border border-[#e5ddd4] bg-white">
              <div className="flex flex-wrap items-center gap-3 p-3 md:p-4">
                <img src={p.image} alt="" className="h-16 w-12 object-cover object-[78%_0%]" />
                <div className="min-w-[180px] flex-1">
                  <input className={fieldClass} value={p.name} onChange={(e) => upd(p.id, { name: e.target.value })} />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {p.category}
                    {p.subcategory ? ` · ${p.subcategory}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {p.showInVitrine !== false && <span className="bg-wine/10 px-2 py-0.5 text-[10px] text-wine">Vitrine</span>}
                  {p.featured && <span className="bg-champagne/40 px-2 py-0.5 text-[10px] text-wine-deep">Destaque</span>}
                  {p.isNew && <span className="bg-wine px-2 py-0.5 text-[10px] text-ivory">Novo</span>}
                  {p.best && <span className="bg-blush px-2 py-0.5 text-[10px] text-wine">Mais vendido</span>}
                </div>
                <select className={fieldClass + " w-28"} value={p.status} onChange={(e) => upd(p.id, { status: e.target.value as Product["status"] })}>
                  <option>publicado</option>
                  <option>rascunho</option>
                </select>
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : p.id)}
                  className="h-11 border border-wine/20 px-3 text-xs tracking-wider text-wine uppercase hover:bg-blush"
                >
                  {open ? "Fechar" : "Editar"}
                </button>
              </div>

              {open && (
                <div className="border-t border-[#eee7e0] bg-[#faf7f4]/40 p-4 md:p-5">
                  <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
                    <div className="space-y-3">
                      <p className="text-[11px] tracking-[0.2em] text-wine/70 uppercase">Classificação</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block text-[11px] font-medium tracking-wide text-wine/80 uppercase">
                          Categoria
                          <select
                            className={fieldClass + " mt-1.5"}
                            value={p.category}
                            onChange={(e) => {
                              const c = catalog.find((x) => x.name === e.target.value)!;
                              upd(p.id, { category: c.name, image: c.image, subcategory: c.subcategories[0] ?? "" });
                            }}
                          >
                            {catalog.map((c) => (
                              <option key={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </label>
                        <label className="block text-[11px] font-medium tracking-wide text-wine/80 uppercase">
                          Subcategoria
                          <select
                            className={fieldClass + " mt-1.5"}
                            value={p.subcategory ?? ""}
                            onChange={(e) => upd(p.id, { subcategory: e.target.value })}
                          >
                            <option value="">Sem subcategoria</option>
                            {subs.map((sub) => (
                              <option key={sub} value={sub}>
                                {sub}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <label className="block text-[11px] font-medium tracking-wide text-wine/80 uppercase">
                          Preço
                          <input type="number" className={fieldClass + " mt-1.5"} value={p.price} onChange={(e) => upd(p.id, { price: +e.target.value })} />
                        </label>
                        <label className="block text-[11px] font-medium tracking-wide text-wine/80 uppercase">
                          Promo
                          <input
                            type="number"
                            className={fieldClass + " mt-1.5"}
                            value={p.promo ?? ""}
                            onChange={(e) => upd(p.id, { promo: e.target.value ? +e.target.value : undefined })}
                          />
                        </label>
                        <label className="block text-[11px] font-medium tracking-wide text-wine/80 uppercase">
                          Estoque
                          <input type="number" className={fieldClass + " mt-1.5"} value={p.stock} onChange={(e) => upd(p.id, { stock: +e.target.value })} />
                        </label>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[11px] tracking-[0.2em] text-wine/70 uppercase">Onde aparece na loja</p>
                      <PlacementToggle
                        label="Vitrine da home"
                        hint="Grade principal de produtos"
                        checked={p.showInVitrine !== false}
                        onChange={(v) => upd(p.id, { showInVitrine: v })}
                      />
                      <PlacementToggle label="Destaques" hint="Filtro e selo de destaque" checked={!!p.featured} onChange={(v) => upd(p.id, { featured: v })} />
                      <PlacementToggle label="Novidades" hint="Badge NOVO + filtro" checked={!!p.isNew} onChange={(v) => upd(p.id, { isNew: v })} />
                      <PlacementToggle label="Mais vendidos" hint="Badge + filtro" checked={!!p.best} onChange={(v) => upd(p.id, { best: v })} />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 border-t border-[#eee7e0] pt-4">
                    <button
                      type="button"
                      className="inline-flex h-10 items-center gap-2 border border-wine/20 px-3 text-xs text-wine"
                      onClick={() => {
                        setProducts([...products, { ...p, id: String(Date.now()), slug: p.slug + "-copia", name: p.name + " (cópia)", status: "rascunho" }]);
                        toast.success("Produto duplicado");
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" /> Duplicar
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-10 items-center gap-2 border border-destructive/30 px-3 text-xs text-destructive"
                      onClick={() => {
                        if (confirm("Excluir produto?")) {
                          setProducts(products.filter((x) => x.id !== p.id));
                          setOpenId(null);
                          toast.message("Produto removido");
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Excluir
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Orders() {
  const [orders, setOrders] = useOrders();
  const st: Order["status"][] = ["Aguardando pagamento", "Pago", "Enviado", "Entregue"];
  return (
    <div className="overflow-hidden border border-[#e5ddd4] bg-white">
      <div className="flex items-center justify-between border-b border-[#eee7e0] bg-[#faf7f4] px-5 py-3">
        <p className="text-sm text-muted-foreground">{orders.length} pedidos no funil</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#faf7f4] text-left text-[11px] tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Pedido</th>
              <th className="px-2 py-3 font-medium">Cliente</th>
              <th className="px-2 py-3 font-medium">Data</th>
              <th className="px-2 py-3 font-medium">Pagamento</th>
              <th className="px-2 py-3 font-medium">Itens</th>
              <th className="px-2 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-[#eee7e0] hover:bg-[#fbfaf8]">
                <td className="px-4 py-3 font-medium">{o.id}</td>
                <td className="px-2 py-3">
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
                <td className="px-2 py-3">{o.date}</td>
                <td className="px-2 py-3">{o.payment ?? "—"}</td>
                <td className="px-2 py-3">{o.items}</td>
                <td className="px-2 py-3 font-medium text-wine">{brl(o.total)}</td>
                <td className="px-4 py-3">
                  <select
                    className={fieldClass}
                    value={o.status}
                    onChange={(e) => {
                      setOrders(orders.map((x) => (x.id === o.id ? { ...x, status: e.target.value as Order["status"] } : x)));
                      toast.success("Status atualizado");
                    }}
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
    </div>
  );
}

const appearanceSections = [
  { id: "promo", label: "Promoção", icon: Megaphone },
  { id: "hero", label: "Banner", icon: Sparkles },
  { id: "slides", label: "Slides", icon: Eye },
  { id: "benefits", label: "Benefícios", icon: Check },
  { id: "collections", label: "Coleções", icon: Store },
  { id: "products", label: "Vitrine", icon: Package },
  { id: "editorial", label: "Institucional", icon: Crown },
  { id: "footer", label: "Rodapé", icon: LayoutDashboard },
] as const;

type AppearanceSection = (typeof appearanceSections)[number]["id"];

function Field({
  label,
  hint,
  value,
  onChange,
  multiline,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium tracking-wide text-wine/80 uppercase">{label}</span>
        {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
      </span>
      {multiline ? (
        <textarea className={areaClass} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className={fieldClass} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

function Appearance() {
  const [s, setS] = useSettings();
  const [section, setSection] = useState<AppearanceSection>("promo");
  const [savedFlash, setSavedFlash] = useState(false);

  const patch = (next: Settings) => {
    setS(next);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 900);
  };
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => patch({ ...s, [k]: v });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border border-[#e5ddd4] bg-white px-4 py-3">
        <div>
          <p className="text-sm font-medium text-wine">Editor de conteúdo da loja</p>
          <p className="text-xs text-muted-foreground">Altere textos por seção com preview em tempo real.</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {savedFlash ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-700">
              <Check className="h-3.5 w-3.5" /> Salvo
            </span>
          ) : (
            <span className="text-muted-foreground">Pronto para editar</span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {appearanceSections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setSection(id)}
            className={`inline-flex items-center gap-2 px-3 py-2 text-xs tracking-wide uppercase transition ${
              section === id ? "bg-wine text-ivory" : "border border-[#e5ddd4] bg-white text-wine hover:border-wine/40"
            }`}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="border border-[#e5ddd4] bg-white p-5 shadow-[0_1px_0_rgba(61,20,24,0.04)] md:p-6">
          {section === "promo" && (
            <EditorBlock title="Barra promocional" subtitle="Faixa no topo da loja">
              <div className="flex items-center justify-between border border-[#eee7e0] bg-[#faf7f4] px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-wine">Exibir barra</p>
                  <p className="text-xs text-muted-foreground">Liga ou desliga o anúncio no topo</p>
                </div>
                <Switch checked={s.promoActive} onCheckedChange={(v) => set("promoActive", v)} />
              </div>
              <Field label="Texto da promoção" value={s.promoText} onChange={(v) => set("promoText", v)} hint={`${s.promoText.length} caracteres`} />
            </EditorBlock>
          )}

          {section === "hero" && (
            <EditorBlock title="Banner principal" subtitle="Primeiro slide do carrossel">
              <Field label="Linha superior" value={s.heroKicker} onChange={(v) => set("heroKicker", v)} />
              <Field label="Título" value={s.heroTitle} onChange={(v) => set("heroTitle", v)} multiline />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Palavra em destaque" value={s.heroAccent} onChange={(v) => set("heroAccent", v)} />
                <Field label="Texto do botão" value={s.heroButton} onChange={(v) => set("heroButton", v)} />
              </div>
            </EditorBlock>
          )}

          {section === "slides" && (
            <EditorBlock title="Slides do carrossel" subtitle="Conteúdo dos slides 2 a 5">
              <div className="space-y-5">
                {s.slides.map((slide, idx) => (
                  <div key={idx} className="border border-[#eee7e0] bg-[#faf7f4]/60 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-[11px] tracking-[0.2em] text-wine uppercase">Slide {idx + 2}</p>
                      <span className="text-[10px] text-muted-foreground">Carrossel home</span>
                    </div>
                    <div className="space-y-3">
                      <Field
                        label="Linha superior"
                        value={slide.kicker}
                        onChange={(v) => set("slides", s.slides.map((sl, i) => (i === idx ? { ...sl, kicker: v } : sl)))}
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Título" value={slide.title} onChange={(v) => set("slides", s.slides.map((sl, i) => (i === idx ? { ...sl, title: v } : sl)))} />
                        <Field label="Destaque" value={slide.accent} onChange={(v) => set("slides", s.slides.map((sl, i) => (i === idx ? { ...sl, accent: v } : sl)))} />
                      </div>
                      <Field label="Texto de apoio" value={slide.text} onChange={(v) => set("slides", s.slides.map((sl, i) => (i === idx ? { ...sl, text: v } : sl)))} multiline />
                      <Field label="Botão" value={slide.button} onChange={(v) => set("slides", s.slides.map((sl, i) => (i === idx ? { ...sl, button: v } : sl)))} />
                    </div>
                  </div>
                ))}
              </div>
            </EditorBlock>
          )}

          {section === "benefits" && (
            <EditorBlock title="Benefícios" subtitle="Faixa abaixo do banner">
              <div className="grid gap-4 sm:grid-cols-2">
                {s.benefits.map((b, idx) => (
                  <div key={idx} className="space-y-3 border border-[#eee7e0] p-4">
                    <p className="text-[11px] tracking-wide text-muted-foreground uppercase">Card {idx + 1}</p>
                    <Field label="Título" value={b.title} onChange={(v) => set("benefits", s.benefits.map((x, i) => (i === idx ? { ...x, title: v } : x)))} />
                    <Field label="Subtítulo" value={b.subtitle} onChange={(v) => set("benefits", s.benefits.map((x, i) => (i === idx ? { ...x, subtitle: v } : x)))} />
                  </div>
                ))}
              </div>
            </EditorBlock>
          )}

          {section === "collections" && (
            <EditorBlock title="Coleções" subtitle="Títulos da grade de categorias">
              <Field label="Linha superior" value={s.collectionsEyebrow} onChange={(v) => set("collectionsEyebrow", v)} />
              <Field label="Título" value={s.collectionsTitle} onChange={(v) => set("collectionsTitle", v)} />
            </EditorBlock>
          )}

          {section === "products" && (
            <EditorBlock title="Vitrine" subtitle="Seção de novidades e mais vendidos">
              <Field label="Título da seção" value={s.productsTitle} onChange={(v) => set("productsTitle", v)} />
            </EditorBlock>
          )}

          {section === "editorial" && (
            <EditorBlock title="Faixa institucional" subtitle="Bloco antes do rodapé">
              <Field label="Frase" value={s.editorialTitle} onChange={(v) => set("editorialTitle", v)} multiline />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Linha inferior" value={s.editorialKicker} onChange={(v) => set("editorialKicker", v)} />
                <Field label="Botão" value={s.editorialButton} onChange={(v) => set("editorialButton", v)} />
              </div>
            </EditorBlock>
          )}

          {section === "footer" && (
            <EditorBlock title="Rodapé" subtitle="Contatos, políticas e pagamento">
              <Field label="Texto da marca" value={s.footerAbout} onChange={(v) => set("footerAbout", v)} multiline />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="WhatsApp (exibição)" value={s.footerWhatsappLabel} onChange={(v) => set("footerWhatsappLabel", v)} />
                <Field label="WhatsApp (DDI + número)" value={s.footerWhatsappNumber} onChange={(v) => set("footerWhatsappNumber", v)} hint="só dígitos" />
              </div>
              <Field label="Instagram" value={s.footerInstagram} onChange={(v) => set("footerInstagram", v)} hint="sem @" />
              <Field label="Título políticas" value={s.footerPoliciesTitle} onChange={(v) => set("footerPoliciesTitle", v)} />
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Política 1" value={s.footerPolicy1} onChange={(v) => set("footerPolicy1", v)} />
                <Field label="Política 2" value={s.footerPolicy2} onChange={(v) => set("footerPolicy2", v)} />
                <Field label="Política 3" value={s.footerPolicy3} onChange={(v) => set("footerPolicy3", v)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Título pagamento" value={s.footerPaymentTitle} onChange={(v) => set("footerPaymentTitle", v)} />
                <Field label="Formas de pagamento" value={s.footerPaymentText} onChange={(v) => set("footerPaymentText", v)} />
              </div>
              <Field label="Copyright" value={s.footerCopyright} onChange={(v) => set("footerCopyright", v)} />
            </EditorBlock>
          )}
        </div>

        <aside className="xl:sticky xl:top-20 xl:self-start">
          <div className="overflow-hidden border border-[#e5ddd4] bg-wine-deep text-ivory shadow-[0_12px_40px_rgba(61,20,24,0.18)]">
            <div className="flex items-center justify-between border-b border-ivory/10 px-4 py-3">
              <p className="text-[11px] tracking-[0.2em] text-champagne uppercase">Preview ao vivo</p>
              <Eye className="h-3.5 w-3.5 text-ivory/50" />
            </div>
            <div className="p-4">
              <AppearancePreview section={section} s={s} />
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">As mudanças já refletem na loja aberta.</p>
        </aside>
      </div>
    </div>
  );
}

function EditorBlock({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="space-y-5">
      <div className="border-b border-[#eee7e0] pb-4">
        <h2 className="font-display text-2xl text-wine">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function AppearancePreview({ section, s }: { section: AppearanceSection; s: Settings }) {
  if (section === "promo") {
    return (
      <div className="space-y-3">
        <p className="text-[10px] text-ivory/40 uppercase">Topo da loja</p>
        {s.promoActive ? (
          <div className="bg-wine px-3 py-2 text-center text-[11px] text-ivory">{s.promoText}</div>
        ) : (
          <p className="text-xs text-ivory/40">Barra desativada</p>
        )}
      </div>
    );
  }
  if (section === "hero") {
    return (
      <div className="space-y-3 bg-wine/40 p-4">
        <p className="text-[10px] tracking-[0.3em] text-ivory/50">{s.heroKicker}</p>
        <p className="font-display text-2xl leading-tight">
          {s.heroTitle} <em className="text-champagne not-italic">{s.heroAccent}</em>
        </p>
        <span className="inline-block border border-ivory/40 px-3 py-1.5 text-[10px] tracking-wider uppercase">{s.heroButton}</span>
      </div>
    );
  }
  if (section === "slides") {
    const slide = s.slides[0];
    return (
      <div className="space-y-2 bg-wine/40 p-4">
        <p className="text-[10px] tracking-[0.25em] text-ivory/50">{slide?.kicker}</p>
        <p className="font-display text-xl">
          {slide?.title} <em className="text-champagne not-italic">{slide?.accent}</em>
        </p>
        <p className="text-xs text-ivory/70">{slide?.text}</p>
        <span className="inline-block border border-ivory/40 px-3 py-1 text-[10px] uppercase">{slide?.button}</span>
      </div>
    );
  }
  if (section === "benefits") {
    return (
      <div className="grid gap-2">
        {s.benefits.map((b, i) => (
          <div key={i} className="border border-ivory/10 bg-wine/30 px-3 py-2">
            <p className="font-display text-sm">{b.title}</p>
            <p className="text-[11px] text-ivory/55">{b.subtitle}</p>
          </div>
        ))}
      </div>
    );
  }
  if (section === "collections") {
    return (
      <div className="space-y-2 text-center">
        <p className="text-[10px] tracking-[0.3em] text-champagne">{s.collectionsEyebrow}</p>
        <p className="font-display text-xl">{s.collectionsTitle}</p>
      </div>
    );
  }
  if (section === "products") {
    return (
      <div className="text-center">
        <p className="font-display text-xl">{s.productsTitle}</p>
        <p className="mt-2 text-[11px] text-ivory/50">Grade de produtos da home</p>
      </div>
    );
  }
  if (section === "editorial") {
    return (
      <div className="space-y-3 bg-wine/40 p-4">
        <p className="font-script text-3xl leading-tight">{s.editorialTitle}</p>
        <p className="text-[10px] tracking-[0.35em] text-ivory/55">{s.editorialKicker}</p>
        <span className="inline-block border border-ivory/40 px-3 py-1 text-[10px] uppercase">{s.editorialButton}</span>
      </div>
    );
  }
  return (
    <div className="space-y-3 text-sm">
      <p className="text-ivory/75">{s.footerAbout}</p>
      <p className="text-xs text-champagne">WhatsApp {s.footerWhatsappLabel}</p>
      <p className="text-xs text-champagne">@{s.footerInstagram.replace(/^@/, "")}</p>
      <div className="border-t border-ivory/10 pt-3 text-[11px] text-ivory/50">
        <p>
          {s.footerPoliciesTitle}: {s.footerPolicy1} · {s.footerPolicy2} · {s.footerPolicy3}
        </p>
        <p className="mt-1">
          {s.footerPaymentTitle}: {s.footerPaymentText}
        </p>
        <p className="mt-2">{s.footerCopyright}</p>
      </div>
    </div>
  );
}
