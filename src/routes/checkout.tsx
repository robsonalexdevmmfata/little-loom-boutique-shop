import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Crown, Lock, MapPin, Package, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import { StoreLayout } from "@/components/StoreLayout";
import { clearAbandonedCart, snapshotAbandonedCart } from "@/lib/cms-extras";
import { brl, calcCartTotals, nextOrderId, resolveCartLines, stockForSize, useCart, useOrders, useProducts, withSyncedStock } from "@/lib/store";
import { quoteShipping, type ShippingQuote } from "@/integrations/shipping";
import { getMpPublicKey } from "@/integrations/mercado-pago";
import { STORE_MP_PUBLIC_KEY } from "@/integrations/store-credentials";
import { trackMeta } from "@/lib/meta-ads";

const MercadoPagoBrick = lazy(() =>
  import("@/components/checkout/MercadoPagoBrick").then((m) => ({ default: m.MercadoPagoBrick })),
);

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — REIS NOIR" },
      { name: "description", content: "Finalize seu pedido na REIS NOIR com pagamento seguro." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

const steps = [
  { id: 0, label: "Identidade" },
  { id: 1, label: "Entrega" },
  { id: 2, label: "Pagamento" },
] as const;

function Checkout() {
  const [cart, setCart] = useCart();
  const [products, setProducts] = useProducts();
  const [orders, setOrders] = useOrders();
  const lines = resolveCartLines(cart, products);

  const [step, setStep] = useState(0);
  const [coupon, setCoupon] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [city, setCity] = useState("");
  const [uf, setUf] = useState("SP");
  const [complement, setComplement] = useState("");
  const [quotes, setQuotes] = useState<ShippingQuote[]>([]);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [shippingId, setShippingId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [mpKey, setMpKey] = useState("");
  const [orderId, setOrderId] = useState("");
  const [payStatus, setPayStatus] = useState("");
  const [draftOrderId] = useState(() => nextOrderId(orders));

  useEffect(() => {
    const c = sessionStorage.getItem("rn-coupon");
    if (c) setCoupon(c);
    setReady(true);
    getMpPublicKey().then((r) => setMpKey(r.publicKey)).catch(() => undefined);
  }, []);

  const selectedShip = quotes.find((q) => q.id === shippingId) ?? null;
  const { subtotal, discount, shipping, total, items } = calcCartTotals(lines, coupon, selectedShip ? selectedShip.price : null);

  const input =
    "h-12 w-full border border-[#e4d8cf] bg-[#fbfaf8] px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-wine focus:bg-white focus:ring-2 focus:ring-wine/10";

  const fetchQuotes = async () => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) {
      toast.error("CEP inválido");
      return;
    }
    setQuoteLoading(true);
    try {
      const res = await quoteShipping({ data: { cep: digits, value: Math.max(0, subtotal - discount), qty: items || 1 } });
      setQuotes(res.quotes);
      setShippingId(res.quotes[0]?.id ?? null);
      toast.success("Fretes calculados");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao cotar frete");
    } finally {
      setQuoteLoading(false);
    }
  };

  const lookupCep = async () => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    try {
      const r = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const j = (await r.json()) as { erro?: boolean; logradouro?: string; localidade?: string; uf?: string };
      if (j.erro) return;
      if (j.logradouro) setStreet(j.logradouro);
      if (j.localidade) setCity(j.localidade);
      if (j.uf) setUf(j.uf);
      await fetchQuotes();
    } catch {
      /* ignore */
    }
  };

  const goNext = () => {
    if (step === 0) {
      if (!name.trim() || !email.trim() || !phone.trim()) {
        toast.error("Preencha nome, e-mail e WhatsApp");
        return;
      }
    }
    if (step === 1) {
      if (!cep.trim() || !street.trim() || !number.trim() || !city.trim() || !shippingId) {
        toast.error("Complete o endereço e escolha o frete");
        return;
      }
    }
    setStep((s) => Math.min(2, s + 1));
  };

  const finishLocalOrder = (status: "Pago" | "Aguardando pagamento", paymentLabel: string, mpId?: string) => {
    setOrders([
      {
        id: draftOrderId,
        customer: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        total,
        status,
        date: new Date().toISOString().slice(0, 10),
        items,
        payment: paymentLabel.includes("PIX") ? "PIX" : paymentLabel.includes("boleto") || paymentLabel.includes("ticket") ? "Boleto" : "Cartão",
        city: `${city}/${uf}`,
        shippingLabel: shippingId || undefined,
      },
      ...orders,
    ]);
    if (status === "Pago") {
      setProducts(
        products.map((p) => {
          const hits = lines.filter((l) => l.productId === p.id);
          if (!hits.length) return p;
          let next = { ...p };
          for (const h of hits) {
            if (next.stockBySize && Object.keys(next.stockBySize).length) {
              const cur = stockForSize(next, h.size);
              next = {
                ...next,
                stockBySize: { ...next.stockBySize, [h.size]: Math.max(0, cur - h.qty) },
              };
            } else {
              next = { ...next, stock: Math.max(0, next.stock - h.qty) };
            }
          }
          return withSyncedStock(next);
        }),
      );
    }
    trackMeta("Purchase", {
      content_ids: lines.map((l) => l.p.sku || l.p.id),
      contents: lines.map((l) => ({ id: l.p.sku || l.p.id, quantity: l.qty, item_price: l.p.promo ?? l.p.price })),
      content_type: "product",
      value: total,
      currency: "BRL",
      num_items: items,
      order_id: draftOrderId,
    });
    clearAbandonedCart("browser");
    setCart([]);
    sessionStorage.removeItem("rn-coupon");
    setOrderId(draftOrderId);
    setPayStatus(mpId ? `${paymentLabel} · MP ${mpId}` : paymentLabel);
  };

  useEffect(() => {
    if (!lines.length) return;
    snapshotAbandonedCart({
      id: "browser",
      items: lines.map((l) => ({ productId: l.productId, name: l.p.name, size: l.size, qty: l.qty })),
      totalHint: total,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
    });
  }, [lines, total, email, phone]);

  const summary = useMemo(
    () => (
      <aside className="h-fit border border-[#e4d8cf] bg-white p-5 shadow-[0_10px_40px_rgba(61,20,24,0.06)]">
        <div className="mb-4 flex items-center gap-2 text-wine">
          <Crown className="h-4 w-4 text-champagne" strokeWidth={1.3} />
          <p className="font-display text-xl">Seu pedido</p>
        </div>
        <div className="space-y-3">
          {lines.map((l) => (
            <div key={`${l.productId}-${l.size}`} className="flex gap-3 border-b border-[#f0e7df] pb-3">
              <img src={l.p.image} alt="" className="h-16 w-12 object-cover object-[78%_0%]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs">{l.p.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {l.size} · {l.qty}x
                </p>
              </div>
              <p className="text-xs text-wine">{brl((l.p.promo ?? l.p.price) * l.qty)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{brl(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-wine">
              <span>Desconto</span>
              <span>−{brl(discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Frete{selectedShip ? ` · ${selectedShip.name}` : ""}</span>
            <span>{selectedShip ? (shipping === 0 ? "Grátis" : brl(shipping)) : "—"}</span>
          </div>
          <div className="flex justify-between border-t border-[#f0e7df] pt-3 text-base">
            <span>Total</span>
            <strong className="font-display text-2xl text-wine">{brl(total)}</strong>
          </div>
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Lock className="h-3 w-3" /> Pagamento seguro · dados protegidos
        </p>
      </aside>
    ),
    [lines, subtotal, discount, shipping, total, selectedShip],
  );

  if (!ready) {
    return (
      <StoreLayout>
        <p className="p-20 text-center text-sm text-muted-foreground">Preparando checkout…</p>
      </StoreLayout>
    );
  }

  if (orderId) {
    return (
      <StoreLayout>
        <div className="mx-auto max-w-lg px-6 py-16 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center border border-champagne/50 bg-wine-deep text-champagne">
            <CheckCircle2 className="h-8 w-8" strokeWidth={1.2} />
          </div>
          <p className="text-[11px] tracking-[0.35em] text-muted-foreground uppercase">REIS NOIR</p>
          <h1 className="mt-2 font-display text-4xl text-wine">Pedido confirmado</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Pedido <strong className="text-foreground">{orderId}</strong>
            {payStatus ? ` · ${payStatus}` : ""}
          </p>
          <div className="mt-6 border border-[#e4d8cf] bg-[#fbfaf8] p-5 text-left text-sm">
            <p>
              <span className="text-muted-foreground">Cliente:</span> {name}
            </p>
            <p className="mt-1">
              <span className="text-muted-foreground">Entrega:</span> {street}, {number}
              {complement ? ` — ${complement}` : ""} · {city}/{uf}
            </p>
            <p className="mt-1">
              <span className="text-muted-foreground">Frete:</span> {selectedShip?.company} {selectedShip?.name} ({selectedShip?.days})
            </p>
            <p className="mt-1">
              <span className="text-muted-foreground">Total:</span> <strong className="text-wine">{brl(total)}</strong>
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/" className="inline-flex h-11 items-center justify-center bg-wine px-6 text-[11px] tracking-[0.2em] text-ivory uppercase">
              Continuar comprando
            </Link>
            <Link to="/admin" className="inline-flex h-11 items-center justify-center border border-wine px-6 text-[11px] tracking-[0.2em] text-wine uppercase">
              Ver no admin
            </Link>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (lines.length === 0) {
    return (
      <StoreLayout>
        <div className="mx-auto max-w-lg px-6 py-20 text-center">
          <Package className="mx-auto h-10 w-10 text-wine/30" strokeWidth={1.2} />
          <p className="mt-4 font-display text-3xl text-wine">Sacola vazia</p>
          <Link to="/" className="mt-6 inline-flex h-11 items-center bg-wine px-6 text-[11px] tracking-[0.2em] text-ivory uppercase">
            Ir às compras
          </Link>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="relative overflow-hidden border-b border-[#eadfd6] bg-[linear-gradient(180deg,#3d1418_0%,#5c1f26_48%,#3d1418_100%)] px-6 py-10 text-ivory md:px-16">
        <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,rgba(217,195,165,0.35),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.08),transparent_35%)]" />
        <div className="relative mx-auto flex max-w-5xl flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-champagne">
              <Crown className="h-5 w-5" strokeWidth={1.2} />
              <span className="font-display text-2xl tracking-wide">REIS NOIR</span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl">Finalizar pedido</h1>
            <p className="mt-2 max-w-md text-sm text-ivory/70">Preencha seus dados para receber sua peça com segurança e carinho.</p>
          </div>
          <p className="flex items-center gap-2 text-[11px] tracking-[0.2em] text-champagne/80 uppercase">
            <ShieldCheck className="h-4 w-4" /> Ambiente seguro
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10 md:px-10 md:py-14">
        <ol className="mb-10 grid grid-cols-3 gap-2">
          {steps.map((s) => (
            <li key={s.id} className={`border-b-2 pb-3 ${step >= s.id ? "border-wine text-wine" : "border-[#e4d8cf] text-muted-foreground"}`}>
              <span className="block text-[10px] tracking-[0.2em] uppercase">0{s.id + 1}</span>
              <span className="mt-1 block text-sm font-medium">{s.label}</span>
            </li>
          ))}
        </ol>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="border border-[#e4d8cf] bg-white p-5 shadow-[0_10px_40px_rgba(61,20,24,0.05)] md:p-8">
            {step === 0 && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl text-wine">Seus dados</h2>
                <p className="text-sm text-muted-foreground">Usamos apenas para entrega e confirmação do pedido.</p>
                <input className={input} placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} />
                <input className={input} type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input className={input} placeholder="WhatsApp" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <button type="button" onClick={goNext} className="h-12 w-full bg-wine text-[11px] tracking-[0.22em] text-ivory uppercase transition hover:bg-wine-deep sm:w-auto sm:px-10">
                  Continuar para entrega
                </button>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl text-wine">Entrega</h2>
                <div className="flex flex-wrap gap-2">
                  <input className={input + " max-w-[180px]"} placeholder="CEP" value={cep} onChange={(e) => setCep(e.target.value)} onBlur={lookupCep} />
                  <button type="button" onClick={lookupCep} className="h-12 border border-wine px-4 text-[11px] tracking-wider text-wine uppercase">
                    Buscar CEP
                  </button>
                </div>
                <input className={input} placeholder="Rua / Avenida" value={street} onChange={(e) => setStreet(e.target.value)} />
                <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
                  <input className={input} placeholder="Número" value={number} onChange={(e) => setNumber(e.target.value)} />
                  <input className={input} placeholder="Complemento (opcional)" value={complement} onChange={(e) => setComplement(e.target.value)} />
                </div>
                <div className="grid gap-3 sm:grid-cols-[1fr_90px]">
                  <input className={input} placeholder="Cidade" value={city} onChange={(e) => setCity(e.target.value)} />
                  <input className={input} placeholder="UF" maxLength={2} value={uf} onChange={(e) => setUf(e.target.value.toUpperCase())} />
                </div>

                <div className="border border-[#eadfd6] bg-[#faf6f2] p-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="flex items-center gap-2 text-sm font-medium text-wine">
                      <Truck className="h-4 w-4" /> Opções de frete
                    </p>
                    <button type="button" onClick={fetchQuotes} disabled={quoteLoading} className="text-[11px] tracking-wider text-wine uppercase underline-offset-2 hover:underline disabled:opacity-50">
                      {quoteLoading ? "Calculando…" : "Recalcular"}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {quotes.length === 0 && <p className="text-xs text-muted-foreground">Informe o CEP para ver as transportadoras.</p>}
                    {quotes.map((q) => (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setShippingId(q.id)}
                        className={`flex w-full items-center justify-between gap-3 border px-3 py-3 text-left transition ${
                          shippingId === q.id ? "border-wine bg-white" : "border-transparent bg-white/60 hover:border-wine/30"
                        }`}
                      >
                        <span>
                          <span className="block text-sm text-wine">
                            {q.company} · {q.name}
                          </span>
                          <span className="block text-[11px] text-muted-foreground">{q.days}</span>
                        </span>
                        <span className="text-sm font-medium text-wine">{q.price === 0 ? "Grátis" : brl(q.price)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button type="button" onClick={() => setStep(0)} className="h-12 border border-[#e4d8cf] px-6 text-[11px] tracking-[0.2em] uppercase">
                    Voltar
                  </button>
                  <button type="button" onClick={goNext} className="h-12 bg-wine px-10 text-[11px] tracking-[0.2em] text-ivory uppercase">
                    Ir para pagamento
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-2xl text-wine">Pagamento</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Cartão, PIX ou boleto. Escolha a forma que preferir.</p>
                  </div>
                  <MapPin className="h-5 w-5 text-champagne" />
                </div>

                <div className="border border-[#eadfd6] bg-[#faf6f2] p-3 text-xs text-muted-foreground">
                  Entrega em {street}, {number} · {city}/{uf} · CEP {cep}
                  {selectedShip ? ` · ${selectedShip.company} ${selectedShip.name}` : ""}
                </div>

                <Suspense fallback={<p className="text-sm text-muted-foreground">Carregando pagamento…</p>}>
                  <MercadoPagoBrick
                    amount={total}
                    publicKey={mpKey || import.meta.env.VITE_MP_PUBLIC_KEY || STORE_MP_PUBLIC_KEY}
                    orderId={draftOrderId}
                    email={email}
                    name={name}
                    description={`Pedido ${draftOrderId} — REIS NOIR`}
                    onPaid={(result) => {
                      const paid = result.status === "approved";
                      finishLocalOrder(paid ? "Pago" : "Aguardando pagamento", `MP ${result.status}`, result.id);
                      toast.success(paid ? "Pagamento aprovado" : "Pagamento registrado");
                    }}
                    onError={(msg) => toast.error(msg)}
                  />
                </Suspense>

                <button type="button" onClick={() => setStep(1)} className="h-11 border border-[#e4d8cf] px-6 text-[11px] tracking-[0.2em] uppercase">
                  Voltar
                </button>
              </div>
            )}
          </div>

          {summary}
        </div>
      </div>
    </StoreLayout>
  );
}
