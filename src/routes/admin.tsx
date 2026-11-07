import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Copy, Plus, Trash2 } from "lucide-react";
import { ADMIN_PASSWORD, brl, categories, images, useOrders, useProducts, useSettings, type Order, type Product } from "@/lib/store";

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

const tabs = ["Painel", "Produtos", "Pedidos", "Aparência"] as const;
const input = "h-9 w-full border border-border bg-background px-2 text-sm";

function Admin() {
  const [ok, setOk] = useState(false);
  const [pw, setPw] = useState("");
  const [tab, setTab] = useState<(typeof tabs)[number]>("Painel");
  useEffect(() => { if (sessionStorage.getItem("rn-admin") === "1") setOk(true); }, []);

  if (!ok)
    return (
      <div className="grid min-h-screen place-items-center bg-wine-deep px-4">
        <form onSubmit={(e) => { e.preventDefault(); if (pw === ADMIN_PASSWORD) { sessionStorage.setItem("rn-admin", "1"); setOk(true); } else alert("Senha incorreta"); }} className="w-full max-w-sm space-y-4 bg-blush p-8">
          <h1 className="text-center font-display text-3xl text-wine">REIS NOIR · Admin</h1>
          <input type="password" placeholder="Senha" value={pw} onChange={(e) => setPw(e.target.value)} className={input + " h-11"} />
          <button className="h-11 w-full bg-wine text-xs tracking-[0.2em] text-ivory uppercase">Entrar</button>
          <p className="text-center text-xs text-muted-foreground">Senha de demonstração: 1234</p>
        </form>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-background font-sans">
      <aside className="w-56 shrink-0 bg-wine-deep p-6 text-ivory">
        <Link to="/" className="font-display text-2xl text-champagne">REIS NOIR</Link>
        <nav className="mt-8 flex flex-col gap-1">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-2 text-left text-sm ${tab === t ? "bg-wine text-ivory" : "text-ivory/70"}`}>{t}</button>
          ))}
          <button onClick={() => { sessionStorage.removeItem("rn-admin"); setOk(false); }} className="mt-6 px-3 py-2 text-left text-sm text-ivory/50">Sair</button>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-8">
        <h1 className="mb-6 font-display text-3xl text-wine">{tab}</h1>
        {tab === "Painel" && <Dashboard />}
        {tab === "Produtos" && <Products />}
        {tab === "Pedidos" && <Orders />}
        {tab === "Aparência" && <Appearance />}
      </main>
    </div>
  );
}

function Dashboard() {
  const [orders] = useOrders();
  const [products] = useProducts();
  const stats = [
    ["Faturamento", brl(orders.filter((o) => o.status !== "Aguardando pagamento").reduce((a, o) => a + o.total, 0))],
    ["Pedidos", orders.length],
    ["Produtos", products.length],
    ["Estoque baixo", products.filter((p) => p.stock <= 5).length],
  ];
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map(([l, v]) => (
        <div key={l} className="border border-border bg-blush p-5"><p className="text-xs text-muted-foreground">{l}</p><p className="mt-2 font-display text-2xl text-wine">{v}</p></div>
      ))}
    </div>
  );
}

function Products() {
  const [products, setProducts] = useProducts();
  const [q, setQ] = useState("");
  const upd = (id: string, patch: Partial<Product>) => setProducts(products.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const add = () => {
    const id = String(Date.now());
    setProducts([...products, { id, slug: `novo-produto-${id}`, name: "Novo produto", category: "Vestidos", price: 399.9, stock: 0, image: images.vestidos, description: "", sizes: ["PP", "P", "M", "G"], status: "rascunho" }]);
  };
  return (
    <div>
      <div className="mb-4 flex gap-3">
        <input placeholder="Pesquisar..." value={q} onChange={(e) => setQ(e.target.value)} className={input + " max-w-xs"} />
        <button onClick={add} className="flex items-center gap-2 bg-wine px-4 text-sm text-ivory"><Plus className="h-4 w-4" /> Novo produto</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted-foreground"><tr><th className="p-2"></th><th className="p-2">Nome</th><th className="p-2">Categoria</th><th className="p-2">Preço</th><th className="p-2">Promo</th><th className="p-2">Estoque</th><th className="p-2">Status</th><th></th></tr></thead>
          <tbody>
            {products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase())).map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-2"><img src={p.image} alt="" className="h-12 w-9 object-cover object-[78%_0%]" /></td>
                <td className="p-2"><input className={input} value={p.name} onChange={(e) => upd(p.id, { name: e.target.value })} /></td>
                <td className="p-2"><select className={input} value={p.category} onChange={(e) => { const c = categories.find((x) => x.name === e.target.value)!; upd(p.id, { category: c.name, image: c.image }); }}>{categories.map((c) => <option key={c.name}>{c.name}</option>)}</select></td>
                <td className="p-2"><input type="number" className={input + " w-24"} value={p.price} onChange={(e) => upd(p.id, { price: +e.target.value })} /></td>
                <td className="p-2"><input type="number" className={input + " w-24"} value={p.promo ?? ""} onChange={(e) => upd(p.id, { promo: e.target.value ? +e.target.value : undefined })} /></td>
                <td className="p-2"><input type="number" className={input + " w-20"} value={p.stock} onChange={(e) => upd(p.id, { stock: +e.target.value })} /></td>
                <td className="p-2"><select className={input} value={p.status} onChange={(e) => upd(p.id, { status: e.target.value as Product["status"] })}><option>publicado</option><option>rascunho</option></select></td>
                <td className="flex gap-2 p-2 pt-5">
                  <button aria-label="Duplicar" onClick={() => setProducts([...products, { ...p, id: String(Date.now()), slug: p.slug + "-copia", name: p.name + " (cópia)", status: "rascunho" }])}><Copy className="h-4 w-4" /></button>
                  <button aria-label="Excluir" onClick={() => confirm("Excluir produto?") && setProducts(products.filter((x) => x.id !== p.id))}><Trash2 className="h-4 w-4 text-destructive" /></button>
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
    <table className="w-full text-sm">
      <thead className="text-left text-xs text-muted-foreground"><tr><th className="p-2">Pedido</th><th className="p-2">Cliente</th><th className="p-2">Data</th><th className="p-2">Itens</th><th className="p-2">Total</th><th className="p-2">Status</th></tr></thead>
      <tbody>
        {orders.map((o) => (
          <tr key={o.id} className="border-t border-border">
            <td className="p-2 font-medium">{o.id}</td>
            <td className="p-2">{o.customer}<br /><span className="text-xs text-muted-foreground">{o.email}</span></td>
            <td className="p-2">{o.date}</td>
            <td className="p-2">{o.items}</td>
            <td className="p-2">{brl(o.total)}</td>
            <td className="p-2"><select className={input} value={o.status} onChange={(e) => setOrders(orders.map((x) => (x.id === o.id ? { ...x, status: e.target.value as Order["status"] } : x)))}>{st.map((s) => <option key={s}>{s}</option>)}</select></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Appearance() {
  const [s, setS] = useSettings();
  const f = (k: keyof typeof s, label: string) => (
    <label className="block text-sm">{label}<input className={input + " mt-1"} value={String(s[k])} onChange={(e) => setS({ ...s, [k]: e.target.value })} /></label>
  );
  return (
    <div className="max-w-xl space-y-4">
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={s.promoActive} onChange={(e) => setS({ ...s, promoActive: e.target.checked })} /> Barra promocional ativa</label>
      {f("promoText", "Texto da barra promocional")}
      {f("heroTitle", "Título do banner")}
      {f("heroAccent", "Palavra em destaque")}
      {f("heroButton", "Texto do botão")}
      {f("editorialTitle", "Frase institucional")}
      <p className="text-xs text-muted-foreground">As alterações aparecem na loja na hora.</p>
    </div>
  );
}
