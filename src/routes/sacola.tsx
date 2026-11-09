import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { StoreLayout } from "@/components/StoreLayout";
import { brl, calcCartTotals, getFreeShippingFrom, resolveCartLines, useCart, useCoupons, useProducts } from "@/lib/store";
import { useState } from "react";

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
  const [coupons] = useCoupons();
  const [coupon, setCoupon] = useState("");
  const lines = resolveCartLines(cart, products);
  const { subtotal, discount, shipping, total, appliedCoupon } = calcCartTotals(lines, coupon);
  const freeFrom = getFreeShippingFrom();
  const toFree = Math.max(0, freeFrom - (subtotal - discount));
  const exampleCoupon = coupons.find((c) => c.active)?.code ?? "CUPOM";

  return (
    <StoreLayout>
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="mb-2 font-display text-4xl text-wine">Sua sacola</h1>
        <p className="mb-8 text-sm text-muted-foreground">Revise as peças e finalize com segurança.</p>

        {lines.length === 0 ? (
          <div className="flex flex-col items-center border border-dashed border-border bg-blush/50 px-6 py-16 text-center">
            <ShoppingBag className="h-10 w-10 text-wine/40" strokeWidth={1.2} />
            <p className="mt-4 font-display text-2xl text-wine">Sua sacola ainda está vazia</p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">As peças certas estão te esperando. Comece pela coleção.</p>
            <Link to="/" className="mt-6 inline-flex items-center gap-2 bg-wine px-6 py-3 text-[11px] tracking-[0.2em] text-ivory uppercase">
              Ver coleção <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 md:grid-cols-[1fr_340px]">
            <div className="space-y-4">
              {lines.map((l, idx) => (
                <div key={`${l.productId}-${l.size}`} className="flex gap-4 border-b border-border pb-5">
                  <Link to="/produto/$slug" params={{ slug: l.p.slug }}>
                    <img src={l.p.image} alt={l.p.name} className="h-28 w-20 object-cover object-[78%_0%]" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link to="/produto/$slug" params={{ slug: l.p.slug }} className="font-medium hover:text-wine">
                      {l.p.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">Tamanho {l.size}</p>
                    <div className="mt-3 flex h-9 w-fit items-center border border-border">
                      <button type="button" className="px-2.5" onClick={() => setCart(cart.map((c, j) => (j === idx ? { ...c, qty: Math.max(1, c.qty - 1) } : c)))}>
                        −
                      </button>
                      <span className="w-8 text-center text-sm">{l.qty}</span>
                      <button type="button" className="px-2.5" onClick={() => setCart(cart.map((c, j) => (j === idx ? { ...c, qty: Math.min(l.p.stock, c.qty + 1) } : c)))}>
                        +
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-wine">{brl((l.p.promo ?? l.p.price) * l.qty)}</p>
                    <button aria-label="Remover" type="button" onClick={() => setCart(cart.filter((_, j) => j !== idx))} className="mt-3 text-muted-foreground transition hover:text-wine">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              <Link to="/" className="inline-flex items-center gap-2 text-sm text-wine hover:underline">
                Continuar comprando
              </Link>
            </div>

            <aside className="h-fit space-y-4 bg-blush p-6 text-sm">
              <p className="font-display text-xl text-wine">Resumo</p>
              {toFree > 0 ? (
                <div>
                  <p className="text-xs text-muted-foreground">Faltam {brl(toFree)} para frete grátis</p>
                  <div className="mt-2 h-1.5 overflow-hidden bg-wine/10">
                    <div className="h-full bg-wine transition-all" style={{ width: `${Math.min(100, ((subtotal - discount) / freeFrom) * 100)}%` }} />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-wine">Frete grátis liberado nesta compra</p>
              )}
              <div className="flex gap-2">
                <input
                  placeholder={`Cupom (ex: ${exampleCoupon})`}
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="h-10 flex-1 border border-border bg-background px-3 text-sm"
                />
              </div>
              {discount > 0 && appliedCoupon && (
                <p className="text-xs text-wine">
                  Cupom {appliedCoupon.code} aplicado (−
                  {appliedCoupon.type === "percent" ? `${appliedCoupon.value}%` : brl(appliedCoupon.value)})
                </p>
              )}
              <div className="space-y-2 border-t border-wine/15 pt-3">
                <div className="flex justify-between"><span>Subtotal</span><span>{brl(subtotal)}</span></div>
                {discount > 0 && (
                  <div className="flex justify-between text-wine">
                    <span>Desconto</span>
                    <span>−{brl(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Frete</span>
                  <span>{shipping ? brl(shipping) : "Grátis"}</span>
                </div>
                <div className="flex justify-between border-t border-wine/15 pt-3 text-lg">
                  <span>Total</span>
                  <strong className="text-wine">{brl(total)}</strong>
                </div>
              </div>
              <Link
                to="/checkout"
                onClick={() => sessionStorage.setItem("rn-coupon", coupon)}
                className="flex h-12 w-full items-center justify-center gap-2 bg-wine text-[11px] tracking-[0.2em] text-ivory uppercase transition hover:bg-wine-deep"
              >
                Ir para o checkout <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <p className="text-center text-[10px] text-muted-foreground">Checkout simulado · ambiente de demonstração</p>
            </aside>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
