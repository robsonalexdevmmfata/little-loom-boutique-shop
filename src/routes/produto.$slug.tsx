import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, ChevronDown, CreditCard, Lock, Package, ShieldCheck, ShoppingBag, Sparkles, Truck } from "lucide-react";
import { toast } from "sonner";
import { StoreLayout } from "@/components/StoreLayout";
import { brl, FREE_SHIPPING_FROM, useCart, useProducts } from "@/lib/store";

export const Route = createFileRoute("/produto/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — REIS NOIR` },
      { name: "description", content: "Detalhes da peça REIS NOIR: tamanhos, preço, composição e parcelamento." },
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
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);
  const [photo, setPhoto] = useState(0);
  const [openAcc, setOpenAcc] = useState<string>("desc");

  const gallery = useMemo(() => {
    if (!p) return [];
    const imgs = [p.image, ...(p.gallery ?? [])];
    return [...new Set(imgs)];
  }, [p]);

  const related = useMemo(() => {
    if (!p) return [];
    return products.filter((x) => x.status === "publicado" && x.id !== p.id && x.category === p.category).slice(0, 4);
  }, [products, p]);

  if (!p) {
    return (
      <StoreLayout>
        <p className="p-20 text-center">
          Produto não encontrado.{" "}
          <Link to="/" className="underline">
            Voltar
          </Link>
        </p>
      </StoreLayout>
    );
  }

  const final = p.promo ?? p.price;
  const save = p.promo ? p.price - p.promo : 0;
  const pixPrice = final * 0.95;
  const lowStock = p.stock > 0 && p.stock <= 5;
  const activePhoto = gallery[photo] ?? p.image;

  const add = (goCheckout: boolean) => {
    if (!size) {
      setSizeError(true);
      toast.error("Escolha seu tamanho para continuar");
      return;
    }
    setSizeError(false);
    const ex = cart.find((c) => c.productId === p.id && c.size === size);
    setCart(ex ? cart.map((c) => (c === ex ? { ...c, qty: Math.min(p.stock, c.qty + qty) } : c)) : [...cart, { productId: p.id, size, qty }]);
    setAdded(true);
    toast.success(goCheckout ? "Quase sua — finalizando pedido…" : "Peça na sacola. Ela combina com você.");
    if (goCheckout) nav({ to: "/checkout" });
    else setTimeout(() => setAdded(false), 2200);
  };

  const accordion = [
    {
      id: "desc",
      title: "Detalhes da peça",
      body: (
        <div className="space-y-3 text-sm text-foreground/80">
          <p>{p.description}</p>
          {p.details && (
            <ul className="list-disc space-y-1 pl-4">
              {p.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          )}
        </div>
      ),
    },
    {
      id: "comp",
      title: "Composição e cuidados",
      body: (
        <div className="space-y-2 text-sm text-foreground/80">
          {p.composition && (
            <p>
              <span className="text-muted-foreground">Composição: </span>
              {p.composition}
            </p>
          )}
          {p.care && (
            <p>
              <span className="text-muted-foreground">Cuidados: </span>
              {p.care}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "ship",
      title: "Frete, troca e pagamento",
      body: (
        <ul className="space-y-2 text-sm text-foreground/80">
          <li>Frete grátis a partir de {brl(FREE_SHIPPING_FROM)} · envio com rastreio</li>
          <li>Troca em até 7 dias após o recebimento</li>
          <li>PIX com 5% off · cartão em até 12x sem juros · boleto</li>
          <li>Embalagem discreta e premium REIS NOIR</li>
        </ul>
      ),
    },
  ];

  return (
    <StoreLayout>
      <div className="px-6 pt-6 text-xs text-muted-foreground md:px-16 lg:px-24">
        <Link to="/" className="hover:text-wine">
          Início
        </Link>
        <span className="mx-2">/</span>
        <a href="/#novidades" className="hover:text-wine">
          {p.category}
        </a>
        <span className="mx-2">/</span>
        <span className="text-foreground">{p.name}</span>
      </div>

      <div className="grid gap-10 px-6 py-8 pb-28 md:grid-cols-2 md:gap-14 md:px-16 md:pb-16 lg:px-24">
        <div>
          <div className="relative aspect-[3/4] overflow-hidden bg-blush">
            <img src={activePhoto} alt={p.name} className="h-full w-full object-cover object-[78%_0%] transition duration-700 hover:scale-105" />
            <div className="absolute left-3 top-3 flex flex-col gap-1">
              {p.isNew && <span className="bg-wine px-2.5 py-1 text-[10px] tracking-wider text-ivory">NOVO</span>}
              {p.best && <span className="bg-champagne px-2.5 py-1 text-[10px] tracking-wider text-wine-deep">MAIS VENDIDO</span>}
              {save > 0 && <span className="bg-ivory px-2.5 py-1 text-[10px] tracking-wider text-wine">-{Math.round((save / p.price) * 100)}%</span>}
            </div>
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {gallery.map((img, i) => (
                <button
                  key={`${img}-${i}`}
                  type="button"
                  onClick={() => setPhoto(i)}
                  className={`h-20 w-14 shrink-0 overflow-hidden border ${photo === i ? "border-wine" : "border-transparent opacity-70 hover:opacity-100"}`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover object-[78%_0%]" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-[11px] tracking-[0.35em] text-muted-foreground uppercase">{p.category}</p>
          <h1 className="mt-2 font-display text-3xl leading-tight text-wine sm:text-4xl lg:text-5xl">{p.name}</h1>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {p.color && <span>Cor: {p.color}</span>}
            {p.sku && <span>SKU: {p.sku}</span>}
          </div>

          {p.best && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-wine">
              <Sparkles className="h-3.5 w-3.5 text-champagne" />
              Escolhida por +40 mulheres esta semana
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-end gap-3">
            {p.promo && <span className="text-lg text-muted-foreground line-through">{brl(p.price)}</span>}
            <strong className="font-display text-3xl text-wine">{brl(final)}</strong>
            {save > 0 && <span className="mb-1 bg-wine/10 px-2 py-0.5 text-xs text-wine">Você economiza {brl(save)}</span>}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            ou <strong className="text-foreground">12x de {brl(final / 12)}</strong> sem juros
          </p>
          <p className="mt-2 text-sm text-wine">
            No PIX: <strong>{brl(pixPrice)}</strong> <span className="text-muted-foreground">(5% off na hora)</span>
          </p>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Escolha o tamanho</p>
              {lowStock && <p className="text-xs text-wine">Restam só {p.stock} — corre</p>}
            </div>
            <div className={`mt-3 flex flex-wrap gap-2 ${sizeError ? "animate-pulse" : ""}`}>
              {p.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSize(s);
                    setSizeError(false);
                  }}
                  className={`h-11 min-w-12 border px-3 text-sm transition ${
                    size === s ? "border-wine bg-wine text-ivory" : sizeError ? "border-wine/60 text-wine" : "border-border hover:border-wine/50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {sizeError && <p className="mt-2 text-xs text-wine">Selecione um tamanho para garantir a modelagem certa.</p>}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex h-11 items-center border border-border">
              <button type="button" className="px-3 text-lg" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Diminuir">
                −
              </button>
              <span className="w-8 text-center text-sm">{qty}</span>
              <button type="button" className="px-3 text-lg" onClick={() => setQty((q) => Math.min(p.stock, q + 1))} aria-label="Aumentar">
                +
              </button>
            </div>
            <span className="text-xs text-muted-foreground">{p.stock > 0 ? `${p.stock} disponíveis` : "Esgotado"}</span>
          </div>

          <div className="mt-7 hidden flex-col gap-3 sm:flex">
            <button
              type="button"
              disabled={p.stock < 1}
              onClick={() => add(true)}
              className="flex h-12 items-center justify-center gap-2 bg-wine px-6 text-[11px] tracking-[0.22em] text-ivory uppercase transition hover:bg-wine-deep disabled:opacity-40"
            >
              <Lock className="h-3.5 w-3.5 opacity-70" />
              Comprar agora — segurança REIS NOIR
            </button>
            <button
              type="button"
              disabled={p.stock < 1}
              onClick={() => add(false)}
              className="flex h-12 items-center justify-center gap-2 border border-wine px-6 text-[11px] tracking-[0.22em] text-wine uppercase transition hover:bg-blush disabled:opacity-40"
            >
              {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
              {added ? "Adicionada à sacola" : "Adicionar à sacola"}
            </button>
          </div>

          <div className="mt-8 grid gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:grid-cols-2">
            <p className="flex items-start gap-2">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-wine" />
              Frete grátis a partir de {brl(FREE_SHIPPING_FROM)}
            </p>
            <p className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-wine" />
              Compra protegida · troca em 7 dias
            </p>
            <p className="flex items-start gap-2">
              <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-wine" />
              Parcele em até 12x sem juros
            </p>
            <p className="flex items-start gap-2">
              <Package className="mt-0.5 h-4 w-4 shrink-0 text-wine" />
              Embalagem discreta e premium
            </p>
          </div>

          <div className="mt-8 border-t border-border">
            {accordion.map((item) => {
              const open = openAcc === item.id;
              return (
                <div key={item.id} className="border-b border-border">
                  <button type="button" onClick={() => setOpenAcc(open ? "" : item.id)} className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-wine">
                    {item.title}
                    <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
                  </button>
                  {open && <div className="pb-4">{item.body}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="border-t border-border bg-blush/40 px-6 py-14 md:px-16 lg:px-24">
          <p className="text-center text-[11px] tracking-[0.4em] text-wine/70 uppercase">Complete o look</p>
          <h2 className="mb-8 text-center font-display text-3xl text-wine">Você também pode gostar</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            {related.map((r) => {
              const price = r.promo ?? r.price;
              return (
                <Link key={r.id} to="/produto/$slug" params={{ slug: r.slug }} className="group">
                  <div className="aspect-[3/4] overflow-hidden bg-blush">
                    <img src={r.image} alt={r.name} className="h-full w-full object-cover object-[78%_0%] transition group-hover:scale-105" />
                  </div>
                  <p className="mt-3 text-sm">{r.name}</p>
                  <p className="text-sm font-medium text-wine">{brl(price)}</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-wine/10 bg-ivory/95 p-3 backdrop-blur sm:hidden">
        <div className="mb-2 flex items-baseline justify-between px-1">
          <span className="font-display text-xl text-wine">{brl(final)}</span>
          <span className="text-[10px] text-muted-foreground">12x {brl(final / 12)}</span>
        </div>
        <div className="flex gap-2">
          <button type="button" disabled={p.stock < 1} onClick={() => add(false)} className="h-12 flex-1 border border-wine text-[10px] tracking-wider text-wine uppercase disabled:opacity-40">
            Sacola
          </button>
          <button type="button" disabled={p.stock < 1} onClick={() => add(true)} className="h-12 flex-[1.4] bg-wine text-[10px] tracking-wider text-ivory uppercase disabled:opacity-40">
            Comprar agora
          </button>
        </div>
      </div>
    </StoreLayout>
  );
}
