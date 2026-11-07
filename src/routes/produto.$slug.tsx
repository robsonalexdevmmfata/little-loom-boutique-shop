import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { StoreLayout } from "@/components/StoreLayout";
import { brl, useCart, useProducts } from "@/lib/store";

export const Route = createFileRoute("/produto/$slug")({
  head: () => ({
    meta: [
      { title: "Produto — REIS NOIR" },
      { name: "description", content: "Detalhes da peça REIS NOIR: tamanhos, preço e parcelamento." },
      { property: "og:title", content: "Produto — REIS NOIR" },
      { property: "og:description", content: "Detalhes da peça REIS NOIR." },
      { property: "og:type", content: "product" },
      { property: "og:image", content: "https://little-loom-boutique-shop.vercel.app/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://little-loom-boutique-shop.vercel.app/og-image.jpg" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const [products] = useProducts();
  const [cart, setCart] = useCart();
  const nav = useNavigate();
  const p = products.find((x) => x.slug === slug);
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  if (!p) return <StoreLayout><p className="p-20 text-center">Produto não encontrado. <Link to="/" className="underline">Voltar</Link></p></StoreLayout>;
  const final = p.promo ?? p.price;
  const add = (go: boolean) => {
    if (!size) return alert("Selecione um tamanho");
    const ex = cart.find((c) => c.productId === p.id && c.size === size);
    setCart(ex ? cart.map((c) => (c === ex ? { ...c, qty: Math.min(p.stock, c.qty + qty) } : c)) : [...cart, { productId: p.id, size, qty }]);
    if (go) nav({ to: "/sacola" });
  };
  return (
    <StoreLayout>
      <div className="grid gap-12 px-6 py-12 md:grid-cols-2 md:px-24">
        <div className="aspect-[3/4] overflow-hidden bg-blush"><img src={p.image} alt={p.name} className="h-full w-full object-cover object-[78%_0%] transition duration-500 hover:scale-125" /></div>
        <div>
          <p className="text-xs tracking-[0.4em] text-muted-foreground">{p.category.toUpperCase()}</p>
          <h1 className="mt-2 font-display text-4xl text-wine">{p.name}</h1>
          <p className="mt-4 text-2xl">
            {p.promo && <span className="mr-3 text-base text-muted-foreground line-through">{brl(p.price)}</span>}
            <strong className="text-wine">{brl(final)}</strong>
          </p>
          <p className="text-sm text-muted-foreground">ou 12x de {brl(final / 12)} sem juros</p>
          <p className="mt-6 text-sm leading-relaxed">{p.description}</p>
          <p className="mt-6 text-sm">Tamanho</p>
          <div className="mt-2 flex gap-2">
            {p.sizes.map((s) => (
              <button key={s} onClick={() => setSize(s)} className={`h-10 w-12 border text-sm ${size === s ? "border-wine bg-wine text-ivory" : "border-border"}`}>{s}</button>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-4">
            <input type="number" min={1} max={p.stock} value={qty} onChange={(e) => setQty(Math.max(1, Math.min(p.stock, +e.target.value)))} className="h-11 w-20 border border-border px-3" />
            <span className="text-xs text-muted-foreground">{p.stock > 0 ? `${p.stock} em estoque` : "Esgotado"}</span>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <button disabled={p.stock < 1} onClick={() => add(true)} className="h-12 bg-wine text-xs tracking-[0.2em] text-ivory uppercase disabled:opacity-40">Comprar agora</button>
            <button disabled={p.stock < 1} onClick={() => add(false)} className="h-12 border border-wine text-xs tracking-[0.2em] text-wine uppercase disabled:opacity-40">Adicionar à sacola</button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">Envio para todo o Brasil com rastreamento.</p>
        </div>
      </div>
    </StoreLayout>
  );
}
