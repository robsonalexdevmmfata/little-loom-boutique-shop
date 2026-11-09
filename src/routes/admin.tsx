import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Check,
  ChevronRight,
  Copy,
  Crown,
  Download,
  ExternalLink,
  Eye,
  BarChart3,
  Filter,
  Images,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessageCircle,
  Package,
  Palette,
  Plus,
  Plug,
  Printer,
  ScrollText,
  Search,
  Settings as SettingsIcon,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  TicketPercent,
  Trash2,
  Upload,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AbandonedPanel } from "@/components/admin/AbandonedPanel";
import { ActivityPanel } from "@/components/admin/ActivityPanel";
import { AdminNotifications } from "@/components/admin/AdminNotifications";
import { AnalyticsPanel } from "@/components/admin/AnalyticsPanel";
import { CommandPalette } from "@/components/admin/CommandPalette";
import { CustomersPanel } from "@/components/admin/CustomersPanel";
import { CouponsPanel } from "@/components/admin/CouponsPanel";
import { DashboardPanel, type AdminGo } from "@/components/admin/DashboardPanel";
import { FaqPanel } from "@/components/admin/FaqPanel";
import { IntegrationsPanel } from "@/components/admin/IntegrationsPanel";
import { InventoryPanel } from "@/components/admin/InventoryPanel";
import { MediaPanel } from "@/components/admin/MediaPanel";
import { MetaAdsPanel } from "@/components/admin/MetaAdsPanel";
import { NewsletterPanel } from "@/components/admin/NewsletterPanel";
import { PoliciesPanel } from "@/components/admin/PoliciesPanel";
import { PopupPanel } from "@/components/admin/PopupPanel";
import { ReportsPanel } from "@/components/admin/ReportsPanel";
import { ReviewsPanel } from "@/components/admin/ReviewsPanel";
import { SeoPanel } from "@/components/admin/SeoPanel";
import { SettingsPanel } from "@/components/admin/SettingsPanel";
import { UsersPanel } from "@/components/admin/UsersPanel";
import { Drawer, EmptyState, Field, ImageUploadField, PageHeader, Panel, ProductStatusBadge, StatusPill, area, field } from "@/components/admin/shared";
import { Switch } from "@/components/ui/switch";
import { exportOrdersCsv, exportProductsCsv, parseProductsCsv } from "@/lib/admin-utils";
import { clearAdminSession, findAdminUser, getAdminSession, logActivity, setAdminSession, useAdminUsers } from "@/lib/cms-extras";
import { printOrderSlip } from "@/lib/print-order";
import {
  brl,
  images,
  useCatalog,
  useCommerce,
  useOrders,
  useProducts,
  useSettings,
  withSyncedStock,
  type CatalogCategory,
  type Order,
  type Product,
  type Settings,
} from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administração — REIS NOIR" },
      { name: "description", content: "Gerencie produtos, pedidos e conteúdo da loja REIS NOIR." },
      { property: "og:title", content: "Administração — REIS NOIR" },
      { property: "og:description", content: "Painel administrativo REIS NOIR." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const navGroups: { label: string; items: { id: TabId; icon: typeof LayoutDashboard; desc: string }[] }[] = [
  {
    label: "Principal",
    items: [
      { id: "Painel", icon: LayoutDashboard, desc: "Visão geral" },
      { id: "Pedidos", icon: ShoppingBag, desc: "Vendas e rastreio" },
      { id: "Clientes", icon: Users, desc: "Compradores" },
      { id: "Sacolas", icon: ShoppingBag, desc: "Abandonadas" },
      { id: "Relatórios", icon: BarChart3, desc: "Métricas" },
      { id: "Histórico", icon: ScrollText, desc: "Alterações" },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { id: "Produtos", icon: Package, desc: "Catálogo e CSV" },
      { id: "Estoque", icon: Warehouse, desc: "Por tamanho" },
      { id: "Mídia", icon: Images, desc: "Biblioteca de fotos" },
      { id: "Avaliações", icon: Star, desc: "Reviews" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { id: "Meta Ads", icon: Megaphone, desc: "Facebook e Instagram" },
      { id: "Analytics", icon: BarChart3, desc: "GA4 e GTM" },
      { id: "Cupons", icon: TicketPercent, desc: "Descontos" },
      { id: "Popup", icon: Sparkles, desc: "Campanha" },
      { id: "Newsletter", icon: MessageCircle, desc: "E-mails" },
      { id: "SEO", icon: Search, desc: "Google" },
      { id: "Aparência", icon: Palette, desc: "Conteúdo da loja" },
      { id: "Políticas", icon: ScrollText, desc: "Privacidade e trocas" },
      { id: "FAQ", icon: ScrollText, desc: "Perguntas" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { id: "Integrações", icon: Plug, desc: "Pagamentos e frete" },
      { id: "Usuários", icon: Users, desc: "Acessos" },
      { id: "Configurações", icon: SettingsIcon, desc: "Operação" },
    ],
  },
];

type TabId = AdminGo;

function Admin() {
  const [ok, setOk] = useState(false);
  const [pw, setPw] = useState("");
  const [tab, setTab] = useState<TabId>("Painel");
  const [err, setErr] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<{ name: string; role: "dono" | "atendente" } | null>(null);
  const [adminUsers] = useAdminUsers();
  const [commerce] = useCommerce();
  const [orders] = useOrders();
  const [products] = useProducts();
  const alertCount =
    orders.filter((o) => o.status === "Aguardando pagamento").length +
    products.filter((p) => p.stock <= (commerce.lowStockThreshold ?? 5)).length;

  useEffect(() => {
    if (sessionStorage.getItem("rn-admin") === "1") {
      setOk(true);
      setSessionUser(getAdminSession());
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!ok) {
    return (
      <div className="grid min-h-screen place-items-center bg-zinc-100 px-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const user = findAdminUser(adminUsers, pw);
            if (user) {
              setAdminSession(user);
              setSessionUser({ name: user.name, role: user.role });
              setOk(true);
              setErr(false);
              logActivity(user.name, "Login", `Acesso como ${user.role}`);
            } else {
              setErr(true);
              toast.error("Senha incorreta");
            }
          }}
          className="w-full max-w-[400px] rounded-xl border border-zinc-200 bg-white p-8 shadow-sm"
        >
          <div className="mb-8 flex flex-col items-center text-center">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-wine text-ivory">
              <Crown className="h-5 w-5" strokeWidth={1.4} />
            </span>
            <h1 className="mt-4 text-lg font-semibold tracking-tight text-zinc-900">REIS NOIR</h1>
            <p className="mt-1 text-sm text-zinc-500">Acesse o painel da loja</p>
            <p className="mt-2 text-[11px] text-zinc-400">Dono: 1234 · Atendimento: loja</p>
          </div>
          <label className="block text-sm font-medium text-zinc-700">
            Senha
            <input
              type="password"
              value={pw}
              onChange={(e) => {
                setPw(e.target.value);
                setErr(false);
              }}
              className={`mt-1.5 ${field} ${err ? "border-red-400 focus:border-red-500 focus:ring-red-200" : ""}`}
              placeholder="Digite sua senha"
              autoFocus
            />
          </label>
          <button
            type="submit"
            className="mt-5 h-11 w-full rounded-md bg-wine text-sm font-medium text-ivory transition hover:bg-wine-deep"
          >
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f4f4f5] font-sans text-zinc-900">
      {navOpen && <button type="button" aria-label="Fechar menu" className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setNavOpen(false)} />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[240px] flex-col border-r border-zinc-800 bg-[#111113] text-zinc-100 transition-transform lg:static lg:translate-x-0 ${
          navOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
          <div className="flex h-14 items-center gap-2.5 border-b border-white/10 px-4">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-wine text-ivory">
            <Crown className="h-3.5 w-3.5" strokeWidth={1.5} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">{commerce.storeName}</p>
            <p className="text-[11px] text-zinc-500">CMS · Administração</p>
          </div>
          <button type="button" className="ml-auto rounded-md p-1 text-zinc-400 lg:hidden" onClick={() => setNavOpen(false)}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-3 overflow-y-auto p-2.5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-2.5 pb-1.5 pt-1 text-[10px] font-medium tracking-[0.14em] text-zinc-500 uppercase">{group.label}</p>
              <div className="flex flex-col gap-0.5">
                {group.items.map(({ id, icon: Icon, desc }) => {
                  const active = tab === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setTab(id);
                        setNavOpen(false);
                      }}
                      className={`flex items-center gap-3 rounded-md px-2.5 py-2.5 text-left transition ${
                        active ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${active ? "text-champagne" : ""}`} strokeWidth={1.6} />
                      <span className="min-w-0">
                        <span className="block text-[13px] font-medium">{id}</span>
                        <span className={`block text-[11px] ${active ? "text-zinc-400" : "text-zinc-600"}`}>{desc}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="mb-2 px-1 text-[11px] text-zinc-500">
            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Loja publicada
            </p>
            {sessionUser && (
              <p className="mt-1 truncate text-zinc-400">
                {sessionUser.name} · {sessionUser.role}
              </p>
            )}
          </div>
          <Link
            to="/"
            className="mb-1 flex items-center gap-2 rounded-md px-2 py-2 text-[13px] text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Ver loja
          </Link>
          <button
            type="button"
            onClick={() => {
              clearAdminSession();
              setSessionUser(null);
              setOk(false);
            }}
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-[13px] text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-zinc-200 bg-white px-4 md:px-6">
          <button type="button" className="rounded-md border border-zinc-200 p-2 text-zinc-600 lg:hidden" onClick={() => setNavOpen(true)}>
            <Menu className="h-4 w-4" />
          </button>
          <div className="flex min-w-0 items-center gap-1.5 text-sm text-zinc-500">
            <Store className="hidden h-3.5 w-3.5 sm:block" />
            <span className="hidden sm:inline">Loja</span>
            <ChevronRight className="hidden h-3.5 w-3.5 text-zinc-300 sm:block" />
            <span className="font-medium text-zinc-900">{tab}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              className="hidden h-9 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-xs text-zinc-500 sm:inline-flex hover:bg-zinc-50"
            >
              <Search className="h-3.5 w-3.5" />
              Buscar
              <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1 py-0.5 text-[10px]">⌘K</kbd>
            </button>
            <AdminNotifications onGo={(t) => setTab(t)} />
            {alertCount > 0 && (
              <button
                type="button"
                onClick={() => setTab(orders.some((o) => o.status === "Aguardando pagamento") ? "Pedidos" : "Produtos")}
                className="hidden items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800 lg:inline-flex"
              >
                {alertCount} alerta{alertCount > 1 ? "s" : ""}
              </button>
            )}
            <span
              className={`hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium sm:inline-flex ${
                commerce.maintenanceMode ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-700"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${commerce.maintenanceMode ? "bg-amber-500" : "bg-emerald-500"}`} />
              {commerce.maintenanceMode ? "Manutenção" : "Online"}
            </span>
            <Link
              to="/"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
            >
              Ver loja <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {tab === "Painel" && <DashboardPanel onGo={(t) => setTab(t)} />}
          {tab === "Produtos" && <Products />}
          {tab === "Estoque" && <InventoryPanel />}
          {tab === "Mídia" && <MediaPanel />}
          {tab === "Pedidos" && <Orders />}
          {tab === "Clientes" && <CustomersPanel />}
          {tab === "Sacolas" && <AbandonedPanel />}
          {tab === "Cupons" && <CouponsPanel />}
          {tab === "Relatórios" && <ReportsPanel />}
          {tab === "Histórico" && <ActivityPanel />}
          {tab === "Aparência" && <Appearance />}
          {tab === "Políticas" && <PoliciesPanel />}
          {tab === "FAQ" && <FaqPanel />}
          {tab === "SEO" && <SeoPanel />}
          {tab === "Avaliações" && <ReviewsPanel />}
          {tab === "Newsletter" && <NewsletterPanel />}
          {tab === "Popup" && <PopupPanel />}
          {tab === "Meta Ads" && <MetaAdsPanel />}
          {tab === "Analytics" && <AnalyticsPanel />}
          {tab === "Integrações" && <IntegrationsPanel onOpenMeta={() => setTab("Meta Ads")} />}
          {tab === "Usuários" && <UsersPanel />}
          {tab === "Configurações" && <SettingsPanel />}
        </main>
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onGo={(t) => setTab(t)} />
    </div>
  );
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
    <label className="flex cursor-pointer items-start justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50/70 px-3 py-2.5">
      <span>
        <span className="block text-sm font-medium text-zinc-800">{label}</span>
        <span className="block text-[11px] text-zinc-500">{hint}</span>
      </span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

function Products() {
  const [products, setProducts] = useProducts();
  const [catalog, setCatalog] = useCatalog();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | Product["status"]>("todos");
  const [openId, setOpenId] = useState<string | null>(null);
  const [showCats, setShowCats] = useState(false);
  const [newSub, setNewSub] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string[]>([]);

  const who = getAdminSession()?.name ?? "Admin";
  const upd = (id: string, patch: Partial<Product>) => {
    setProducts(products.map((p) => (p.id === id ? withSyncedStock({ ...p, ...patch }) : p)));
    if (patch.price != null || patch.promo !== undefined || patch.stock != null || patch.stockBySize) {
      const p = products.find((x) => x.id === id);
      logActivity(who, "Produto", `${p?.name ?? id}: preço/estoque alterado`);
    }
  };

  const importCsv = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const { products: next, created, updated } = parseProductsCsv(String(reader.result), products);
        setProducts(next.map(withSyncedStock));
        logActivity(who, "Import CSV", `${created} novos · ${updated} atualizados`);
        toast.success(`CSV importado: ${created} novos, ${updated} atualizados`);
      } catch {
        toast.error("CSV inválido");
      }
    };
    reader.readAsText(file);
  };

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
    toast.success("Produto criado");
  };

  const addSubcategory = (catName: string) => {
    const name = (newSub[catName] ?? "").trim();
    if (!name) return;
    setCatalog(
      catalog.map((c) => (c.name === catName && !c.subcategories.includes(name) ? { ...c, subcategories: [...c.subcategories, name] } : c)),
    );
    setNewSub((s) => ({ ...s, [catName]: "" }));
    toast.success(`Subcategoria “${name}” criada`);
  };

  const removeSubcategory = (catName: string, sub: string) => {
    setCatalog(catalog.map((c) => (c.name === catName ? { ...c, subcategories: c.subcategories.filter((x) => x !== sub) } : c)));
    setProducts(products.map((p) => (p.category === catName && p.subcategory === sub ? { ...p, subcategory: "" } : p)));
  };

  const list = products.filter((p) => {
    const matchQ = p.name.toLowerCase().includes(q.toLowerCase()) || (p.sku ?? "").toLowerCase().includes(q.toLowerCase());
    const matchStatus = statusFilter === "todos" || p.status === statusFilter;
    return matchQ && matchStatus;
  });

  const openProduct = products.find((p) => p.id === openId) ?? null;
  const subsOf = (cat: string) => catalog.find((c) => c.name === cat)?.subcategories ?? [];

  return (
    <div>
      <PageHeader
        title="Produtos"
        subtitle={`${products.length} itens no catálogo`}
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => exportProductsCsv(products)}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              <Download className="h-3.5 w-3.5" /> Exportar CSV
            </button>
            <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50">
              <Upload className="h-3.5 w-3.5" /> Importar CSV
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) importCsv(f);
                  e.target.value = "";
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => setShowCats((v) => !v)}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              <Filter className="h-3.5 w-3.5" /> Categorias
            </button>
            <button type="button" onClick={add} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-wine px-3 text-xs font-medium text-ivory hover:bg-wine-deep">
              <Plus className="h-3.5 w-3.5" /> Novo produto
            </button>
          </div>
        }
      />

      {showCats && (
        <Panel className="mb-5 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">Categorias e subcategorias</h2>
              <p className="text-xs text-zinc-500">Organize o catálogo da loja</p>
            </div>
            <button type="button" onClick={() => setShowCats(false)} className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {catalog.map((c: CatalogCategory) => (
              <div key={c.name} className="space-y-3 rounded-lg border border-zinc-200 p-4">
                <div>
                  <p className="text-sm font-medium text-zinc-900">{c.name}</p>
                  <p className="text-[11px] text-zinc-500">{c.subcategories.length} subcategorias · foto da coleção na home</p>
                </div>
                <ImageUploadField
                  label="Foto da coleção"
                  value={c.image}
                  aspect="portrait"
                  onChange={(v) => {
                    if (!v) return;
                    setCatalog(catalog.map((x) => (x.name === c.name ? { ...x, image: v } : x)));
                  }}
                />
                <div className="flex flex-wrap gap-1.5">
                  {c.subcategories.length === 0 && <span className="text-xs text-zinc-400">Nenhuma ainda</span>}
                  {c.subcategories.map((sub) => (
                    <span key={sub} className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] text-zinc-700">
                      {sub}
                      <button type="button" aria-label={`Remover ${sub}`} className="text-zinc-400 hover:text-zinc-700" onClick={() => removeSubcategory(c.name, sub)}>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className={field}
                    placeholder="Nova subcategoria…"
                    value={newSub[c.name] ?? ""}
                    onChange={(e) => setNewSub((s) => ({ ...s, [c.name]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSubcategory(c.name))}
                  />
                  <button type="button" onClick={() => addSubcategory(c.name)} className="h-10 shrink-0 rounded-md bg-zinc-900 px-3 text-xs font-medium text-white hover:bg-zinc-800">
                    Adicionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      <Panel className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-zinc-100 px-4 py-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input placeholder="Buscar por nome ou SKU…" value={q} onChange={(e) => setQ(e.target.value)} className={`${field} pl-9`} />
          </div>
          <div className="flex rounded-md border border-zinc-200 bg-zinc-50 p-0.5">
            {(
              [
                ["todos", "Todos"],
                ["publicado", "Publicados"],
                ["rascunho", "Rascunhos"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setStatusFilter(id)}
                className={`rounded px-3 py-1.5 text-xs font-medium transition ${statusFilter === id ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="text-xs text-zinc-500">{list.length} resultado{list.length === 1 ? "" : "s"}</span>
        </div>

        {selected.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-wine/10 bg-wine/[0.03] px-4 py-2.5">
            <span className="text-xs font-medium text-wine">{selected.length} selecionado{selected.length > 1 ? "s" : ""}</span>
            <button
              type="button"
              className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
              onClick={() => {
                setProducts(products.map((p) => (selected.includes(p.id) ? { ...p, status: "publicado" } : p)));
                toast.success("Produtos publicados");
                setSelected([]);
              }}
            >
              Publicar
            </button>
            <button
              type="button"
              className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
              onClick={() => {
                setProducts(products.map((p) => (selected.includes(p.id) ? { ...p, status: "rascunho" } : p)));
                toast.success("Movidos para rascunho");
                setSelected([]);
              }}
            >
              Rascunho
            </button>
            <button
              type="button"
              className="rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
              onClick={() => {
                if (!confirm(`Excluir ${selected.length} produto(s)?`)) return;
                setProducts(products.filter((p) => !selected.includes(p.id)));
                setSelected([]);
                setOpenId(null);
                toast.message("Produtos removidos");
              }}
            >
              Excluir
            </button>
            <button type="button" className="text-xs text-zinc-500 hover:underline" onClick={() => setSelected([])}>
              Limpar
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-zinc-50 text-left text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={list.length > 0 && list.every((p) => selected.includes(p.id))}
                    onChange={(e) => setSelected(e.target.checked ? list.map((p) => p.id) : [])}
                    aria-label="Selecionar todos"
                  />
                </th>
                <th className="px-3 py-3">Produto</th>
                <th className="px-3 py-3">Categoria</th>
                <th className="px-3 py-3">Preço</th>
                <th className="px-3 py-3">Estoque</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className={`border-t border-zinc-100 transition hover:bg-zinc-50/80 ${openId === p.id ? "bg-wine/[0.03]" : ""}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(p.id)}
                      onChange={(e) => setSelected((prev) => (e.target.checked ? [...prev, p.id] : prev.filter((id) => id !== p.id)))}
                      aria-label={`Selecionar ${p.name}`}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt="" className="h-12 w-9 rounded object-cover object-[78%_0%]" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-zinc-900">{p.name}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {p.showInVitrine !== false && <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-600">Vitrine</span>}
                          {p.featured && <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-800">Destaque</span>}
                          {p.isNew && <span className="rounded bg-wine/10 px-1.5 py-0.5 text-[10px] text-wine">Novo</span>}
                          {p.best && <span className="rounded bg-sky-50 px-1.5 py-0.5 text-[10px] text-sky-800">Mais vendido</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-zinc-600">
                    {p.category}
                    {p.subcategory ? <span className="block text-[11px] text-zinc-400">{p.subcategory}</span> : null}
                  </td>
                  <td className="px-3 py-3 tabular-nums">
                    {p.promo != null ? (
                      <span>
                        <span className="font-medium text-zinc-900">{brl(p.promo)}</span>
                        <span className="ml-1 text-[11px] text-zinc-400 line-through">{brl(p.price)}</span>
                      </span>
                    ) : (
                      <span className="font-medium">{brl(p.price)}</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`tabular-nums ${p.stock <= 5 ? "font-medium text-amber-700" : "text-zinc-700"}`}>{p.stock}</span>
                  </td>
                  <td className="px-3 py-3">
                    <ProductStatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setOpenId(openId === p.id ? null : p.id)}
                      className="rounded-md border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-white"
                    >
                      {openId === p.id ? "Fechar" : "Editar"}
                    </button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-sm text-zinc-500">
                    Nenhum produto encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {openProduct && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button type="button" aria-label="Fechar editor" className="absolute inset-0 bg-black/40" onClick={() => setOpenId(null)} />
          <div className="relative flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs font-medium text-zinc-500">Editar produto</p>
                <h2 className="truncate text-base font-semibold text-zinc-900">{openProduct.name}</h2>
              </div>
              <button type="button" onClick={() => setOpenId(null)} className="rounded-md p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              <div className="flex gap-4">
                <img src={openProduct.image} alt="" className="h-24 w-16 rounded-lg object-cover object-[78%_0%]" />
                <div className="min-w-0 flex-1 space-y-3">
                  <label className="block text-xs font-medium text-zinc-600">
                    Nome
                    <input className={`${field} mt-1.5`} value={openProduct.name} onChange={(e) => upd(openProduct.id, { name: e.target.value })} />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block text-xs font-medium text-zinc-600">
                      Status
                      <select className={`${field} mt-1.5`} value={openProduct.status} onChange={(e) => upd(openProduct.id, { status: e.target.value as Product["status"] })}>
                        <option value="publicado">Publicado</option>
                        <option value="rascunho">Rascunho</option>
                      </select>
                    </label>
                    <label className="block text-xs font-medium text-zinc-600">
                      SKU
                      <input className={`${field} mt-1.5`} value={openProduct.sku ?? ""} onChange={(e) => upd(openProduct.id, { sku: e.target.value })} placeholder="Opcional" />
                    </label>
                  </div>
                </div>
              </div>

              <section className="space-y-3">
                <h3 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">Classificação</h3>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-xs font-medium text-zinc-600">
                    Categoria
                    <select
                      className={`${field} mt-1.5`}
                      value={openProduct.category}
                      onChange={(e) => {
                        const c = catalog.find((x) => x.name === e.target.value)!;
                        upd(openProduct.id, { category: c.name, image: c.image, subcategory: c.subcategories[0] ?? "" });
                      }}
                    >
                      {catalog.map((c) => (
                        <option key={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs font-medium text-zinc-600">
                    Subcategoria
                    <select className={`${field} mt-1.5`} value={openProduct.subcategory ?? ""} onChange={(e) => upd(openProduct.id, { subcategory: e.target.value })}>
                      <option value="">Sem subcategoria</option>
                      {subsOf(openProduct.category).map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">Preço e estoque</h3>
                <div className="grid grid-cols-3 gap-3">
                  <label className="block text-xs font-medium text-zinc-600">
                    Preço
                    <input type="number" className={`${field} mt-1.5`} value={openProduct.price} onChange={(e) => upd(openProduct.id, { price: +e.target.value })} />
                  </label>
                  <label className="block text-xs font-medium text-zinc-600">
                    Promo
                    <input
                      type="number"
                      className={`${field} mt-1.5`}
                      value={openProduct.promo ?? ""}
                      onChange={(e) => upd(openProduct.id, { promo: e.target.value ? +e.target.value : undefined })}
                    />
                  </label>
                  <label className="block text-xs font-medium text-zinc-600">
                    Estoque total
                    <input
                      type="number"
                      className={`${field} mt-1.5`}
                      value={openProduct.stock}
                      onChange={(e) => upd(openProduct.id, { stock: +e.target.value, stockBySize: undefined })}
                      disabled={Boolean(openProduct.stockBySize && Object.keys(openProduct.stockBySize).length)}
                    />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-xs font-medium text-zinc-600">
                    Cor
                    <input className={`${field} mt-1.5`} value={openProduct.color ?? ""} onChange={(e) => upd(openProduct.id, { color: e.target.value })} />
                  </label>
                  <label className="block text-xs font-medium text-zinc-600">
                    Tamanhos
                    <input
                      className={`${field} mt-1.5`}
                      value={openProduct.sizes.join(", ")}
                      onChange={(e) =>
                        upd(openProduct.id, {
                          sizes: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="PP, P, M, G"
                    />
                  </label>
                </div>
                <div className="rounded-lg border border-zinc-200 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-zinc-600">Estoque por tamanho</p>
                    <button
                      type="button"
                      className="text-[11px] font-medium text-wine hover:underline"
                      onClick={() => {
                        if (openProduct.stockBySize && Object.keys(openProduct.stockBySize).length) {
                          upd(openProduct.id, { stockBySize: undefined });
                          toast.message("Voltou ao estoque único");
                        } else {
                          const base = Math.floor(openProduct.stock / Math.max(1, openProduct.sizes.length));
                          let rest = openProduct.stock - base * openProduct.sizes.length;
                          const stockBySize: Record<string, number> = {};
                          for (const s of openProduct.sizes) {
                            stockBySize[s] = base + (rest > 0 ? 1 : 0);
                            if (rest > 0) rest -= 1;
                          }
                          upd(openProduct.id, { stockBySize });
                          toast.success("Estoque distribuído por tamanho");
                        }
                      }}
                    >
                      {openProduct.stockBySize && Object.keys(openProduct.stockBySize).length ? "Usar estoque único" : "Ativar por tamanho"}
                    </button>
                  </div>
                  {openProduct.stockBySize && Object.keys(openProduct.stockBySize).length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {openProduct.sizes.map((sz) => (
                        <label key={sz} className="text-[11px] font-medium text-zinc-500">
                          {sz}
                          <input
                            type="number"
                            className={`${field} mt-1`}
                            value={openProduct.stockBySize?.[sz] ?? 0}
                            onChange={(e) =>
                              upd(openProduct.id, {
                                stockBySize: { ...openProduct.stockBySize, [sz]: Math.max(0, +e.target.value || 0) },
                              })
                            }
                          />
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-zinc-400">Opcional: controle separado PP/P/M/G.</p>
                  )}
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">Descrição</h3>
                <textarea className={area} value={openProduct.description} onChange={(e) => upd(openProduct.id, { description: e.target.value })} placeholder="Descrição do produto na loja" />
                <textarea className={area} value={openProduct.composition ?? ""} onChange={(e) => upd(openProduct.id, { composition: e.target.value })} placeholder="Composição" />
                <textarea className={area} value={openProduct.care ?? ""} onChange={(e) => upd(openProduct.id, { care: e.target.value })} placeholder="Cuidados com a peça" />
              </section>

              <section className="space-y-3">
                <h3 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">Mídia</h3>
                <ImageUploadField
                  label="Foto principal"
                  hint="aparece na loja e na vitrine"
                  value={openProduct.image}
                  aspect="portrait"
                  onChange={(v) => {
                    if (v) upd(openProduct.id, { image: v });
                  }}
                />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-zinc-600">Galeria</p>
                  <div className="flex flex-wrap gap-2">
                    {(openProduct.gallery ?? []).map((g, gi) => (
                      <div key={`${g.slice(0, 24)}-${gi}`} className="relative h-16 w-12 overflow-hidden rounded border border-zinc-200">
                        <img src={g} alt="" className="h-full w-full object-cover object-top" />
                        <button
                          type="button"
                          className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-[9px] text-white"
                          onClick={() => upd(openProduct.id, { gallery: (openProduct.gallery ?? []).filter((_, i) => i !== gi) })}
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                  <ImageUploadField
                    label="Adicionar foto à galeria"
                    value={undefined}
                    aspect="portrait"
                    onChange={(v) => {
                      if (!v) return;
                      upd(openProduct.id, { gallery: [...(openProduct.gallery ?? []), v] });
                    }}
                  />
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">SEO</h3>
                <label className="block text-xs font-medium text-zinc-600">
                  Título SEO
                  <input
                    className={`${field} mt-1.5`}
                    value={openProduct.seoTitle ?? ""}
                    onChange={(e) => upd(openProduct.id, { seoTitle: e.target.value })}
                    placeholder={openProduct.name}
                  />
                </label>
                <label className="block text-xs font-medium text-zinc-600">
                  Descrição SEO
                  <textarea
                    className={`${area} mt-1.5`}
                    value={openProduct.seoDescription ?? ""}
                    onChange={(e) => upd(openProduct.id, { seoDescription: e.target.value })}
                    placeholder="Resumo para buscadores"
                  />
                </label>
              </section>

              <section className="space-y-3">
                <h3 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">Onde aparece na loja</h3>
                <PlacementToggle label="Vitrine da home" hint="Grade principal de produtos" checked={openProduct.showInVitrine !== false} onChange={(v) => upd(openProduct.id, { showInVitrine: v })} />
                <PlacementToggle label="Destaques" hint="Filtro e selo de destaque" checked={!!openProduct.featured} onChange={(v) => upd(openProduct.id, { featured: v })} />
                <PlacementToggle label="Novidades" hint="Badge NOVO + filtro" checked={!!openProduct.isNew} onChange={(v) => upd(openProduct.id, { isNew: v })} />
                <PlacementToggle label="Mais vendidos" hint="Badge + filtro" checked={!!openProduct.best} onChange={(v) => upd(openProduct.id, { best: v })} />
              </section>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-zinc-200 px-5 py-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-zinc-200 px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                  onClick={() => {
                    setProducts([
                      ...products,
                      { ...openProduct, id: String(Date.now()), slug: openProduct.slug + "-copia", name: openProduct.name + " (cópia)", status: "rascunho" },
                    ]);
                    toast.success("Produto duplicado");
                  }}
                >
                  <Copy className="h-3.5 w-3.5" /> Duplicar
                </button>
                <button
                  type="button"
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-red-200 px-3 text-xs font-medium text-red-600 hover:bg-red-50"
                  onClick={() => {
                    if (confirm("Excluir produto?")) {
                      setProducts(products.filter((x) => x.id !== openProduct.id));
                      setOpenId(null);
                      toast.message("Produto removido");
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Excluir
                </button>
              </div>
              <button type="button" onClick={() => setOpenId(null)} className="h-9 rounded-md bg-wine px-4 text-xs font-medium text-ivory hover:bg-wine-deep">
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Orders() {
  const [orders, setOrders] = useOrders();
  const [settings] = useSettings();
  const [commerce] = useCommerce();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | Order["status"]>("todos");
  const [openId, setOpenId] = useState<string | null>(null);
  const st: Order["status"][] = ["Aguardando pagamento", "Pago", "Enviado", "Entregue"];

  const list = orders.filter((o) => {
    const hay = `${o.id} ${o.customer} ${o.email}`.toLowerCase();
    const matchQ = hay.includes(q.toLowerCase());
    const matchStatus = statusFilter === "todos" || o.status === statusFilter;
    return matchQ && matchStatus;
  });

  const openOrder = orders.find((o) => o.id === openId) ?? null;

  const counts = useMemo(() => {
    const base = { todos: orders.length } as Record<"todos" | Order["status"], number>;
    st.forEach((s) => {
      base[s] = orders.filter((o) => o.status === s).length;
    });
    return base;
  }, [orders]);

  return (
    <div>
      <PageHeader
        title="Pedidos"
        subtitle="Acompanhe e atualize o status das vendas"
        actions={
          <button
            type="button"
            onClick={() => exportOrdersCsv(orders)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <Download className="h-3.5 w-3.5" /> Exportar CSV
          </button>
        }
      />

      <Panel className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-zinc-100 px-4 py-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input placeholder="Buscar pedido, cliente ou e-mail…" value={q} onChange={(e) => setQ(e.target.value)} className={`${field} pl-9`} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ["todos", "Todos"],
                ["Aguardando pagamento", "Aguardando"],
                ["Pago", "Pago"],
                ["Enviado", "Enviado"],
                ["Entregue", "Entregue"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setStatusFilter(id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  statusFilter === id ? "bg-wine text-ivory" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {label}
                <span className={`tabular-nums ${statusFilter === id ? "text-ivory/70" : "text-zinc-400"}`}>{counts[id]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-zinc-50 text-left text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
              <tr>
                <th className="px-4 py-3">Pedido</th>
                <th className="px-3 py-3">Cliente</th>
                <th className="px-3 py-3">Data</th>
                <th className="px-3 py-3">Pagamento</th>
                <th className="px-3 py-3">Itens</th>
                <th className="px-3 py-3">Total</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-4 py-3 text-right"> </th>
              </tr>
            </thead>
            <tbody>
              {list.map((o) => (
                <tr key={o.id} className="border-t border-zinc-100 hover:bg-zinc-50/80">
                  <td className="px-4 py-3 font-medium">{o.id}</td>
                  <td className="px-3 py-3">
                    <p className="text-zinc-900">{o.customer}</p>
                    <p className="text-xs text-zinc-500">{o.email}</p>
                    {o.city && <p className="text-xs text-zinc-400">{o.city}</p>}
                  </td>
                  <td className="px-3 py-3 text-zinc-600">{o.date}</td>
                  <td className="px-3 py-3 text-zinc-600">{o.payment ?? "—"}</td>
                  <td className="px-3 py-3 tabular-nums text-zinc-600">{o.items}</td>
                  <td className="px-3 py-3 font-medium tabular-nums text-zinc-900">{brl(o.total)}</td>
                  <td className="px-3 py-3">
                    <StatusPill status={o.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setOpenId(o.id)}
                      className="rounded-md border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-white"
                    >
                      Detalhes
                    </button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <EmptyState title="Nenhum pedido encontrado" text="Ajuste os filtros ou aguarde novas vendas na loja." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Drawer
        open={!!openOrder}
        title={openOrder?.id ?? ""}
        subtitle="Detalhes do pedido"
        onClose={() => setOpenId(null)}
        footer={
          openOrder ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex min-w-[200px] flex-1 items-center gap-2 text-xs font-medium text-zinc-600">
                Status
                <select
                  className={field}
                  value={openOrder.status}
                  onChange={(e) => {
                    setOrders(orders.map((x) => (x.id === openOrder.id ? { ...x, status: e.target.value as Order["status"] } : x)));
                    toast.success("Status atualizado");
                  }}
                >
                  {st.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => printOrderSlip(openOrder, commerce.storeName || "REIS NOIR")}
                  className="inline-flex h-10 items-center gap-1.5 rounded-md border border-zinc-200 px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  <Printer className="h-3.5 w-3.5" /> Imprimir
                </button>
                <button type="button" onClick={() => setOpenId(null)} className="h-10 rounded-md bg-wine px-4 text-xs font-medium text-ivory hover:bg-wine-deep">
                  Fechar
                </button>
              </div>
            </div>
          ) : null
        }
      >
        {openOrder && (
          <div className="space-y-5 text-sm">
            <div className="grid gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-zinc-500">Cliente</p>
                <p className="font-medium text-zinc-900">{openOrder.customer}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">E-mail</p>
                <p className="text-zinc-800">{openOrder.email}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Telefone</p>
                <p className="text-zinc-800">{openOrder.phone ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Cidade</p>
                <p className="text-zinc-800">{openOrder.city ?? "—"}</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-zinc-200 p-4">
                <p className="text-xs text-zinc-500">Pagamento</p>
                <p className="mt-1 font-medium">{openOrder.payment ?? "—"}</p>
              </div>
              <div className="rounded-lg border border-zinc-200 p-4">
                <p className="text-xs text-zinc-500">Data</p>
                <p className="mt-1 font-medium">{openOrder.date}</p>
              </div>
              <div className="rounded-lg border border-zinc-200 p-4">
                <p className="text-xs text-zinc-500">Itens</p>
                <p className="mt-1 font-medium">{openOrder.items}</p>
              </div>
              <div className="rounded-lg border border-zinc-200 p-4">
                <p className="text-xs text-zinc-500">Total</p>
                <p className="mt-1 text-lg font-semibold text-wine">{brl(openOrder.total)}</p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-zinc-500 uppercase">Status atual</p>
              <StatusPill status={openOrder.status} />
            </div>
            <div className="space-y-3 rounded-lg border border-zinc-200 p-4">
              <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">Envio e rastreio</p>
              <label className="block text-xs font-medium text-zinc-600">
                Código de rastreio
                <input
                  className={`${field} mt-1.5`}
                  value={openOrder.trackingCode ?? ""}
                  onChange={(e) => {
                    const trackingCode = e.target.value;
                    setOrders(
                      orders.map((x) =>
                        x.id === openOrder.id
                          ? {
                              ...x,
                              trackingCode,
                              status: trackingCode.trim() && x.status === "Pago" ? "Enviado" : x.status,
                            }
                          : x,
                      ),
                    );
                  }}
                  placeholder="Ex.: ME123456789BR"
                />
              </label>
              <label className="block text-xs font-medium text-zinc-600">
                URL de rastreio
                <input
                  className={`${field} mt-1.5`}
                  value={openOrder.trackingUrl ?? ""}
                  onChange={(e) => setOrders(orders.map((x) => (x.id === openOrder.id ? { ...x, trackingUrl: e.target.value } : x)))}
                  placeholder="https://…"
                />
              </label>
              <label className="block text-xs font-medium text-zinc-600">
                Etiqueta / obs. frete
                <input
                  className={`${field} mt-1.5`}
                  value={openOrder.shippingLabel ?? ""}
                  onChange={(e) => setOrders(orders.map((x) => (x.id === openOrder.id ? { ...x, shippingLabel: e.target.value } : x)))}
                  placeholder="Melhor Envio · PAC"
                />
              </label>
              {openOrder.trackingCode && (
                <button
                  type="button"
                  onClick={() => {
                    setOrders(orders.map((x) => (x.id === openOrder.id ? { ...x, status: "Enviado" } : x)));
                    logActivity(getAdminSession()?.name ?? "Admin", "Pedido", `${openOrder.id} marcado como Enviado`);
                    toast.success("Status: Enviado");
                  }}
                  className="h-9 rounded-md bg-wine px-3 text-xs font-medium text-ivory hover:bg-wine-deep"
                >
                  Marcar como enviado
                </button>
              )}
            </div>
            <label className="block text-xs font-medium text-zinc-600">
              Nota interna
              <textarea
                className={`${area} mt-1.5`}
                value={openOrder.note ?? ""}
                onChange={(e) => setOrders(orders.map((x) => (x.id === openOrder.id ? { ...x, note: e.target.value } : x)))}
                placeholder="Observações da equipe sobre este pedido…"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <a
                href={`https://wa.me/${(openOrder.phone || settings.footerWhatsappNumber).replace(/\D/g, "")}?text=${encodeURIComponent(
                  openOrder.trackingCode
                    ? `Olá ${openOrder.customer}! Seu pedido ${openOrder.id} foi enviado. Rastreio: ${openOrder.trackingCode}${openOrder.trackingUrl ? ` — ${openOrder.trackingUrl}` : ""}`
                    : `Olá ${openOrder.customer}! Sobre seu pedido ${openOrder.id} na REIS NOIR…`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
              >
                <MessageCircle className="h-3.5 w-3.5" /> {openOrder.trackingCode ? "Avisar rastreio" : "Falar no WhatsApp"}
              </a>
              {openOrder.trackingUrl && (
                <a
                  href={openOrder.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-200 px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Abrir rastreio
                </a>
              )}
            </div>
          </div>
        )}
      </Drawer>
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
  const current = appearanceSections.find((x) => x.id === section)!;

  return (
    <div>
      <PageHeader
        title="Aparência"
        subtitle="Edite os textos e seções da loja"
        actions={
          savedFlash ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              <Check className="h-3.5 w-3.5" /> Salvo
            </span>
          ) : (
            <span className="text-xs text-zinc-500">Salvamento automático</span>
          )
        }
      />

      <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)_320px]">
        <Panel className="h-fit overflow-hidden p-2">
          {appearanceSections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm transition ${
                section === id ? "bg-wine text-ivory" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              {label}
            </button>
          ))}
        </Panel>

        <Panel className="p-5 md:p-6">
          {section === "promo" && (
            <EditorBlock title="Barra promocional" subtitle="Faixa no topo · pode agendar datas">
              <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-zinc-900">Exibir barra</p>
                  <p className="text-xs text-zinc-500">Liga ou desliga o anúncio no topo</p>
                </div>
                <Switch checked={s.promoActive} onCheckedChange={(v) => set("promoActive", v)} />
              </div>
              <Field label="Texto da promoção" value={s.promoText} onChange={(v) => set("promoText", v)} hint={`${s.promoText.length} caracteres`} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Início (opcional)" type="date" value={s.promoStart ?? ""} onChange={(v) => set("promoStart", v)} hint="YYYY-MM-DD" />
                <Field label="Fim (opcional)" type="date" value={s.promoEnd ?? ""} onChange={(v) => set("promoEnd", v)} hint="só neste intervalo" />
              </div>
            </EditorBlock>
          )}

          {section === "hero" && (
            <EditorBlock title="Banner principal" subtitle="Primeiro slide · foto com fundo esmaecido">
              <ImageUploadField
                label="Foto do banner"
                hint="JPG/PNG · modelo à direita funciona melhor"
                value={s.heroImage}
                onChange={(v) => set("heroImage", v)}
              />
              <Field label="Linha superior" value={s.heroKicker} onChange={(v) => set("heroKicker", v)} />
              <Field label="Título" value={s.heroTitle} onChange={(v) => set("heroTitle", v)} multiline />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Palavra em destaque" value={s.heroAccent} onChange={(v) => set("heroAccent", v)} />
                <Field label="Texto do botão" value={s.heroButton} onChange={(v) => set("heroButton", v)} />
              </div>
            </EditorBlock>
          )}

          {section === "slides" && (
            <EditorBlock title="Slides do carrossel" subtitle="Slides 2 a 5 · cada um com foto e fade">
              <div className="space-y-4">
                {s.slides.map((slide, idx) => (
                  <div key={idx} className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50/60 p-4">
                    <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">Slide {idx + 2}</p>
                    <ImageUploadField
                      label="Foto do slide"
                      value={slide.image}
                      onChange={(v) => set("slides", s.slides.map((sl, i) => (i === idx ? { ...sl, image: v } : sl)))}
                    />
                    <Field label="Linha superior" value={slide.kicker} onChange={(v) => set("slides", s.slides.map((sl, i) => (i === idx ? { ...sl, kicker: v } : sl)))} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Título" value={slide.title} onChange={(v) => set("slides", s.slides.map((sl, i) => (i === idx ? { ...sl, title: v } : sl)))} />
                      <Field label="Destaque" value={slide.accent} onChange={(v) => set("slides", s.slides.map((sl, i) => (i === idx ? { ...sl, accent: v } : sl)))} />
                    </div>
                    <Field label="Texto de apoio" value={slide.text} onChange={(v) => set("slides", s.slides.map((sl, i) => (i === idx ? { ...sl, text: v } : sl)))} multiline />
                    <Field label="Botão" value={slide.button} onChange={(v) => set("slides", s.slides.map((sl, i) => (i === idx ? { ...sl, button: v } : sl)))} />
                  </div>
                ))}
              </div>
            </EditorBlock>
          )}

          {section === "benefits" && (
            <EditorBlock title="Benefícios" subtitle="Faixa abaixo do banner">
              <div className="grid gap-4 sm:grid-cols-2">
                {s.benefits.map((b, idx) => (
                  <div key={idx} className="space-y-3 rounded-lg border border-zinc-200 p-4">
                    <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">Card {idx + 1}</p>
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
            <EditorBlock title="Vitrine" subtitle="Banner com fade + título da grade de produtos">
              <ImageUploadField
                label="Banner da vitrine"
                hint="opcional · mesmo efeito de esmaecer do hero"
                value={s.productsBannerImage}
                onChange={(v) => set("productsBannerImage", v)}
                aspect="wide"
              />
              <Field label="Título da seção" value={s.productsTitle} onChange={(v) => set("productsTitle", v)} />
            </EditorBlock>
          )}

          {section === "editorial" && (
            <EditorBlock title="Faixa institucional" subtitle="Bloco antes do rodapé · foto com fade">
              <ImageUploadField
                label="Foto de fundo"
                value={s.editorialImage}
                onChange={(v) => set("editorialImage", v)}
                aspect="wide"
              />
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
        </Panel>

        <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          <Panel className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
              <div>
                <p className="text-[11px] font-medium tracking-wide text-zinc-500 uppercase">Prévia ao vivo</p>
                <p className="text-sm font-medium text-zinc-900">Home da loja</p>
              </div>
              <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-wine hover:underline">
                Abrir <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="bg-zinc-100 p-2">
              <div className="overflow-hidden rounded-md border border-zinc-200 bg-white shadow-inner">
                <iframe key={savedFlash ? "flash" : "live"} title="Prévia da loja" src="/" className="h-[420px] w-full origin-top scale-[1] bg-white" />
              </div>
            </div>
            <p className="px-4 py-2 text-[11px] text-zinc-500">Salve/edite e a loja atualiza (mesmo navegador). Recarregue a prévia se precisar.</p>
          </Panel>
          <Panel className="overflow-hidden bg-[#111113] text-zinc-100">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <p className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">Seção</p>
                <p className="text-sm font-medium text-white">{current.label}</p>
              </div>
              <Eye className="h-4 w-4 text-zinc-500" />
            </div>
            <div className="p-4">
              <AppearancePreview section={section} s={s} />
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function EditorBlock({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="space-y-5">
      <div className="border-b border-zinc-100 pb-4">
        <h2 className="text-lg font-semibold tracking-tight text-zinc-900">{title}</h2>
        <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function AppearancePreview({ section, s }: { section: AppearanceSection; s: Settings }) {
  if (section === "promo") {
    return (
      <div className="space-y-3">
        <p className="text-[10px] text-zinc-500 uppercase">Topo da loja</p>
        {s.promoActive ? (
          <div className="rounded-md bg-wine px-3 py-2 text-center text-[11px] text-ivory">{s.promoText}</div>
        ) : (
          <p className="text-xs text-zinc-500">Barra desativada</p>
        )}
      </div>
    );
  }
  if (section === "hero") {
    return (
      <div className="relative overflow-hidden rounded-md bg-wine-deep">
        {s.heroImage && <img src={s.heroImage} alt="" className="absolute inset-0 h-full w-full object-cover object-[72%_20%] opacity-80" />}
        <div className="absolute inset-0 bg-gradient-to-r from-wine-deep via-wine-deep/80 to-transparent" />
        <div className="relative space-y-3 p-4">
          <p className="text-[10px] tracking-[0.3em] text-zinc-400">{s.heroKicker}</p>
          <p className="font-display text-2xl leading-tight text-ivory">
            {s.heroTitle} <em className="text-champagne not-italic">{s.heroAccent}</em>
          </p>
          <span className="inline-block border border-ivory/40 px-3 py-1.5 text-[10px] tracking-wider text-ivory uppercase">{s.heroButton}</span>
        </div>
      </div>
    );
  }
  if (section === "slides") {
    const slide = s.slides[0];
    return (
      <div className="space-y-2 rounded-md bg-wine/40 p-4">
        <p className="text-[10px] tracking-[0.25em] text-zinc-400">{slide?.kicker}</p>
        <p className="font-display text-xl text-ivory">
          {slide?.title} <em className="text-champagne not-italic">{slide?.accent}</em>
        </p>
        <p className="text-xs text-zinc-300">{slide?.text}</p>
        <span className="inline-block border border-ivory/40 px-3 py-1 text-[10px] text-ivory uppercase">{slide?.button}</span>
      </div>
    );
  }
  if (section === "benefits") {
    return (
      <div className="grid gap-2">
        {s.benefits.map((b, i) => (
          <div key={i} className="rounded-md border border-white/10 bg-white/5 px-3 py-2">
            <p className="font-display text-sm text-ivory">{b.title}</p>
            <p className="text-[11px] text-zinc-400">{b.subtitle}</p>
          </div>
        ))}
      </div>
    );
  }
  if (section === "collections") {
    return (
      <div className="space-y-2 text-center">
        <p className="text-[10px] tracking-[0.3em] text-champagne">{s.collectionsEyebrow}</p>
        <p className="font-display text-xl text-ivory">{s.collectionsTitle}</p>
      </div>
    );
  }
  if (section === "products") {
    return (
      <div className="relative overflow-hidden rounded-md">
        {s.productsBannerImage ? (
          <>
            <img src={s.productsBannerImage} alt="" className="absolute inset-0 h-full w-full object-cover object-[72%_20%]" />
            <div className="absolute inset-0 bg-gradient-to-r from-wine-deep via-wine-deep/75 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-wine/40" />
        )}
        <div className="relative space-y-2 p-4">
          <p className="text-[10px] tracking-[0.3em] text-zinc-400 uppercase">Vitrine</p>
          <p className="font-display text-xl text-ivory">{s.productsTitle}</p>
        </div>
      </div>
    );
  }
  if (section === "editorial") {
    return (
      <div className="space-y-3 rounded-md bg-wine/40 p-4">
        <p className="font-script text-3xl leading-tight text-ivory">{s.editorialTitle}</p>
        <p className="text-[10px] tracking-[0.35em] text-zinc-400">{s.editorialKicker}</p>
        <span className="inline-block border border-ivory/40 px-3 py-1 text-[10px] text-ivory uppercase">{s.editorialButton}</span>
      </div>
    );
  }
  return (
    <div className="space-y-3 text-sm">
      <p className="text-zinc-300">{s.footerAbout}</p>
      <p className="text-xs text-champagne">WhatsApp {s.footerWhatsappLabel}</p>
      <p className="text-xs text-champagne">@{s.footerInstagram.replace(/^@/, "")}</p>
      <div className="border-t border-white/10 pt-3 text-[11px] text-zinc-500">
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
