import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, CreditCard, FileText, QrCode, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { StoreLayout } from "@/components/StoreLayout";
import {
  brl,
  calcCartTotals,
  nextOrderId,
  type PaymentMethod,
  resolveCartLines,
  useCart,
  useOrders,
  useProducts,
} from "@/lib/store";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — REIS NOIR" },
      { name: "description", content: "Finalize seu pedido REIS NOIR com checkout seguro simulado." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

const steps = ["Dados", "Entrega", "Pagamento", "Confirmação"] as const;

function Checkout() {
  const [cart, setCart] = useCart();
  const [products] = useProducts();
  const [orders, setOrders] = useOrders();
  const nav = useNavigate();
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
  const [payment, setPayment] = useState<PaymentMethod>("PIX");
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const c = sessionStorage.getItem("rn-coupon");
    if (c) setCoupon(c);
    setReady(true);
  }, []);

  const { subtotal, discount, shipping, total, items } = calcCartTotals(lines, coupon);
  const input = "h-11 w-full border border-border bg-background px-3 text-sm outline-none focus:border-wine";

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
          <CheckCircle2 className="mx-auto h-14 w-14 text-wine" strokeWidth={1.2} />
          <h1 className="mt-4 font-display text-4xl text-wine">Pedido confirmado</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Simulação concluída. Seu pedido <strong className="text-foreground">{orderId}</strong> foi registrado no painel.
          </p>
          <div className="mt-6 border border-border bg-blush p-5 text-left text-sm">
            <p>
              <span className="text-muted-foreground">Cliente:</span> {name}
            </p>
            <p className="mt-1">
              <span className="text-muted-foreground">Pagamento:</span> {payment}
            </p>
            <p className="mt-1">
              <span className="text-muted-foreground">Total:</span> <strong className="text-wine">{brl(total)}</strong>
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              {payment === "PIX" && "No ambiente real, um QR Code PIX seria exibido aqui."}
              {payment === "Cartão" && "No ambiente real, a cobrança seria autorizada na operadora."}
              {payment === "Boleto" && "No ambiente real, o boleto seria gerado para pagamento."}
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
          <p className="font-display text-3xl text-wine">Nada para finalizar</p>
          <p className="mt-2 text-sm text-muted-foreground">Adicione peças à sacola antes do checkout.</p>
          <Link to="/" className="mt-6 inline-flex h-11 items-center bg-wine px-6 text-[11px] tracking-[0.2em] text-ivory uppercase">
            Ir às compras
          </Link>
        </div>
      </StoreLayout>
    );
  }

  const next = () => {
    if (step === 0) {
      if (!name.trim() || !email.trim() || !phone.trim()) {
        toast.error("Preencha nome, e-mail e WhatsApp");
        return;
      }
    }
    if (step === 1) {
      if (!cep.trim() || !street.trim() || !number.trim() || !city.trim()) {
        toast.error("Complete o endereço de entrega");
        return;
      }
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const finish = () => {
    setProcessing(true);
    window.setTimeout(() => {
      const id = nextOrderId(orders);
      setOrders([
        {
          id,
          customer: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          total,
          status: payment === "Boleto" ? "Aguardando pagamento" : "Pago",
          date: new Date().toISOString().slice(0, 10),
          items,
          payment,
          city: `${city}/${uf}`,
        },
        ...orders,
      ]);
      setCart([]);
      sessionStorage.removeItem("rn-coupon");
      setOrderId(id);
      setProcessing(false);
      toast.success(`Pedido ${id} criado`);
    }, 1400);
  };

  const payOpts: { id: PaymentMethod; title: string; desc: string; icon: typeof QrCode }[] = [
    { id: "PIX", title: "PIX", desc: "Aprovação imediata · 5% off já no preço", icon: QrCode },
    { id: "Cartão", title: "Cartão de crédito", desc: "Até 12x sem juros", icon: CreditCard },
    { id: "Boleto", title: "Boleto bancário", desc: "Compensa em até 2 dias úteis", icon: FileText },
  ];

  return (
    <StoreLayout>
      <div className="mx-auto max-w-5xl px-6 py-10 md:py-14">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl text-wine">Checkout</h1>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-wine" /> Ambiente simulado · dados ficam só neste navegador
            </p>
          </div>
          <button type="button" onClick={() => nav({ to: "/sacola" })} className="text-sm text-wine hover:underline">
            Voltar à sacola
          </button>
        </div>

        <ol className="mb-10 flex gap-2 overflow-x-auto">
          {steps.map((label, i) => (
            <li
              key={label}
              className={`flex min-w-[7rem] flex-1 flex-col border-b-2 pb-2 text-xs ${i <= step ? "border-wine text-wine" : "border-border text-muted-foreground"}`}
            >
              <span className="text-[10px] tracking-wider uppercase">Passo {i + 1}</span>
              <span className="mt-0.5 font-medium">{label}</span>
            </li>
          ))}
        </ol>

        <div className="grid gap-10 md:grid-cols-[1fr_320px]">
          <div>
            {step === 0 && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl text-wine">Seus dados</h2>
                <input className={input} placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} />
                <input className={input} type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input className={input} placeholder="WhatsApp (11) 99999-0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
                <button type="button" onClick={next} className="h-12 w-full bg-wine text-[11px] tracking-[0.2em] text-ivory uppercase sm:w-auto sm:px-10">
                  Continuar
                </button>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl text-wine">Entrega</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input className={input} placeholder="CEP" value={cep} onChange={(e) => setCep(e.target.value)} />
                  <input className={input} placeholder="Número" value={number} onChange={(e) => setNumber(e.target.value)} />
                </div>
                <input className={input} placeholder="Rua / Avenida" value={street} onChange={(e) => setStreet(e.target.value)} />
                <div className="grid gap-3 sm:grid-cols-[1fr_80px]">
                  <input className={input} placeholder="Cidade" value={city} onChange={(e) => setCity(e.target.value)} />
                  <input className={input} placeholder="UF" maxLength={2} value={uf} onChange={(e) => setUf(e.target.value.toUpperCase())} />
                </div>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => setStep(0)} className="h-12 border border-border px-6 text-[11px] tracking-[0.2em] uppercase">
                    Voltar
                  </button>
                  <button type="button" onClick={next} className="h-12 bg-wine px-10 text-[11px] tracking-[0.2em] text-ivory uppercase">
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl text-wine">Pagamento</h2>
                <div className="space-y-3">
                  {payOpts.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPayment(opt.id)}
                        className={`flex w-full items-start gap-3 border p-4 text-left transition ${payment === opt.id ? "border-wine bg-blush" : "border-border hover:border-wine/40"}`}
                      >
                        <Icon className="mt-0.5 h-5 w-5 text-wine" strokeWidth={1.4} />
                        <span>
                          <span className="block text-sm font-medium">{opt.title}</span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">{opt.desc}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button type="button" onClick={() => setStep(1)} className="h-12 border border-border px-6 text-[11px] tracking-[0.2em] uppercase">
                    Voltar
                  </button>
                  <button
                    type="button"
                    disabled={processing}
                    onClick={finish}
                    className="h-12 bg-wine px-10 text-[11px] tracking-[0.2em] text-ivory uppercase disabled:opacity-60"
                  >
                    {processing ? "Processando…" : `Pagar ${brl(total)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="h-fit space-y-3 border border-border p-5 text-sm">
            <p className="font-display text-xl text-wine">Pedido</p>
            {lines.map((l) => (
              <div key={`${l.productId}-${l.size}`} className="flex gap-3 border-b border-border pb-3">
                <img src={l.p.image} alt="" className="h-16 w-12 object-cover object-[78%_0%]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs">{l.p.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {l.size} · {l.qty}x
                  </p>
                </div>
                <p className="text-xs">{brl((l.p.promo ?? l.p.price) * l.qty)}</p>
              </div>
            ))}
            <div className="space-y-1.5 pt-1 text-xs">
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
                <span>Frete</span>
                <span>{shipping ? brl(shipping) : "Grátis"}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base">
                <span>Total</span>
                <strong className="text-wine">{brl(total)}</strong>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </StoreLayout>
  );
}
