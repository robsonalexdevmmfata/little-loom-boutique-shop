import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { StoreLayout } from "@/components/StoreLayout";
import { brl, useCart, useOrders, useProducts } from "@/lib/store";

export const Route = createFileRoute("/sacola")({
  head: () => ({
    meta: [
      { title: "Sacola — REIS NOIR" },
      { name: "description", content: "Revise sua sacola e finalize o pedido na REIS NOIR." },
      { property: "og:title", content: "Sacola — REIS NOIR" },
      { property: "og:description", content: "Revise sua sacola REIS NOIR." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Cart,
});

function Cart() {
  const [cart, setCart] = useCart();
  const [products] = useProducts();
  const [orders, setOrders] = useOrders();
  const [coupon, setCoupon] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState("");
  const lines = cart.map((c) => ({ ...c, p: products.find((p) => p.id === c.productId)! })).filter((l) => l.p);
  const subtotal = lines.reduce((a, l) => a + (l.p.promo ?? l.p.price) * l.qty, 0);
  const discount = coupon.trim().toUpperCase() === "BEMVINDA" ? subtotal * 0.1 : 0;
  const shipping = subtotal > 0 && subtotal < 500 ? 29.9 : 0;
  const total = subtotal - discount + shipping;

  const checkout = () => {
    if (!name || !email) return alert("Preencha nome e e-mail");
    const id = `RN-${1043 + orders.length - 4}`;
    setOrders([{ id, customer: name, email, total, status: "Aguardando pagamento", date: new Date().toISOString().slice(0, 10), items: lines.reduce((a, l) => a + l.qty, 0) }, ...orders]);
    setCart([]);
    setDone(id);
  };

  return (
    <StoreLayout>
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="mb-8 font-display text-4xl text-wine">Sua sacola</h1>
        {done ? (
          <p>Pedido <strong>{done}</strong> criado e aguardando pagamento. <Link to="/" className="underline">Continuar comprando</Link></p>
        ) : lines.length === 0 ? (
          <p>Sua sacola está vazia. <Link to="/" className="underline">Ver coleção</Link></p>
        ) : (
          <div className="grid gap-10 md:grid-cols-[1fr_340px]">
            <div className="space-y-4">
              {lines.map((l, idx) => (
                <div key={idx} className="flex gap-4 border-b border-border pb-4">
                  <img src={l.p.image} alt="" className="h-28 w-20 object-cover object-[78%_0%]" />
                  <div className="flex-1">
                    <p>{l.p.name}</p>
                    <p className="text-xs text-muted-foreground">Tamanho {l.size}</p>
                    <input type="number" min={1} max={l.p.stock} value={l.qty} onChange={(e) => setCart(cart.map((c, j) => (j === idx ? { ...c, qty: Math.max(1, Math.min(l.p.stock, +e.target.value)) } : c)))} className="mt-2 h-9 w-16 border border-border px-2" />
                  </div>
                  <div className="text-right">
                    <p className="text-wine">{brl((l.p.promo ?? l.p.price) * l.qty)}</p>
                    <button aria-label="Remover" onClick={() => setCart(cart.filter((_, j) => j !== idx))} className="mt-2 text-muted-foreground"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3 bg-blush p-6 text-sm">
              <input placeholder="Cupom (ex: BEMVINDA)" value={coupon} onChange={(e) => setCoupon(e.target.value)} className="h-10 w-full border border-border bg-background px-3" />
              <div className="flex justify-between"><span>Subtotal</span><span>{brl(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-wine"><span>Desconto</span><span>-{brl(discount)}</span></div>}
              <div className="flex justify-between"><span>Frete</span><span>{shipping ? brl(shipping) : "Grátis"}</span></div>
              <div className="flex justify-between border-t border-wine/20 pt-3 text-lg"><span>Total</span><strong className="text-wine">{brl(total)}</strong></div>
              <input placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} className="h-10 w-full border border-border bg-background px-3" />
              <input placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 w-full border border-border bg-background px-3" />
              <button onClick={checkout} className="h-12 w-full bg-wine text-xs tracking-[0.2em] text-ivory uppercase">Finalizar pedido</button>
            </div>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
