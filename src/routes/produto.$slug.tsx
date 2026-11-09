import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, CreditCard, Lock, Package, ShieldCheck, ShoppingBag, Sparkles, Star, Truck } from "lucide-react";
import { toast } from "sonner";
import { StoreLayout } from "@/components/StoreLayout";
import { reviewAvatar, useReviews } from "@/lib/cms-extras";
import { metaContentFromProduct, trackMeta } from "@/lib/meta-ads";
import { brl, getFreeShippingFrom, stockForSize, useCart, useProducts } from "@/lib/store";

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
  const [reviews, setReviews] = useReviews();
  const nav = useNavigate();
  const p = products.find((x) => x.slug === slug);
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);
  const [photo, setPhoto] = useState(0);
  const [openAcc, setOpenAcc] = useState<string>("desc");
  const [zoom, setZoom] = useState({ on: false, x: 50, y: 50 });
  const [revName, setRevName] = useState("");
  const [revText, setRevText] = useState("");
  const [revRating, setRevRating] = useState(5);

  const gallery = useMemo(() => {
    if (!p) return [];
    const imgs = [p.image, ...(p.gallery ?? [])];
    return [...new Set(imgs)];
  }, [p]);

  const related = useMemo(() => {
    if (!p) return [];
    return products.filter((x) => x.status === "publicado" && x.id !== p.id && x.category === p.category).slice(0, 4);
  }, [products, p]);

  useEffect(() => {
    if (!p) return;
    trackMeta("ViewContent", metaContentFromProduct(p));
  }, [p?.id]);

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
  const available = size ? stockForSize(p, size) : p.stock;
  const lowStock = available > 0 && available <= 5;
  const activePhoto = gallery[photo] ?? p.image;
  const freeFrom = getFreeShippingFrom();
  const productReviews = reviews.filter((r) => r.productId === p.id && r.approved);
  const avgRating = productReviews.length
    ? productReviews.reduce((a, r) => a + r.rating, 0) / productReviews.length
    : 0;

  const add = (goCheckout: boolean) => {
    if (!size) {
      setSizeError(true);
      toast.error("Escolha seu tamanho para continuar");
      return;
    }
    const max = stockForSize(p, size);
    if (max < 1) {
      toast.error("Tamanho esgotado");
      return;
    }
    setSizeError(false);
    const ex = cart.find((c) => c.productId === p.id && c.size === size);
    setCart(ex ? cart.map((c) => (c === ex ? { ...c, qty: Math.min(max, c.qty + qty) } : c)) : [...cart, { productId: p.id, size, qty: Math.min(max, qty) }]);
    trackMeta("AddToCart", { ...metaContentFromProduct(p), quantity: qty });
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
          <li>Frete grátis a partir de {brl(freeFrom)} · envio com rastreio</li>
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
          <div
            className="group relative aspect-[3/4] overflow-hidden bg-blush max-md:cursor-default md:cursor-zoom-in"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              setZoom({ on: true, x, y });
            }}
            onMouseLeave={() => setZoom((z) => ({ ...z, on: false }))}
          >
            <img
              src={activePhoto}
              alt={p.name}
              className="h-full w-full object-cover object-[78%_0%] will-change-transform"
              style={{
                transformOrigin: `${zoom.x}% ${zoom.y}%`,
                transform: zoom.on ? "scale(2.35)" : "scale(1)",
                transition: zoom.on ? "transform 80ms ease-out" : "transform 280ms ease-out",
              }}
            />
            <div className={`pointer-events-none absolute left-3 top-3 flex flex-col gap-1 transition ${zoom.on ? "opacity-0" : "opacity-100"}`}>
              {p.featured && <span className="bg-champagne px-2.5 py-1 text-[10px] tracking-wider text-wine-deep">DESTAQUE</span>}
              {p.isNew && <span className="bg-wine px-2.5 py-1 text-[10px] tracking-wider text-ivory">NOVO</span>}
              {p.best && <span className="bg-ivory px-2.5 py-1 text-[10px] tracking-wider text-wine">MAIS VENDIDO</span>}
              {save > 0 && <span className="bg-ivory px-2.5 py-1 text-[10px] tracking-wider text-wine">-{Math.round((save / p.price) * 100)}%</span>}
            </div>
            <p className={`pointer-events-none absolute bottom-3 left-3 hidden bg-wine-deep/70 px-2.5 py-1 text-[10px] tracking-wider text-ivory uppercase transition md:block ${zoom.on ? "opacity-0" : "opacity-100"}`}>
              Passe o mouse para ampliar
            </p>
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {gallery.map((img, i) => (
                <button
                  key={`${img}-${i}`}
                  type="button"
                  onClick={() => {
                    setPhoto(i);
                    setZoom((z) => ({ ...z, on: false }));
                  }}
                  className={`h-20 w-14 shrink-0 overflow-hidden border ${photo === i ? "border-wine" : "border-transparent opacity-70 hover:opacity-100"}`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover object-[78%_0%]" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-[11px] tracking-[0.35em] text-muted-foreground uppercase">
            {p.category}
            {p.subcategory ? ` · ${p.subcategory}` : ""}
          </p>
          <h1 className="mt-2 font-display text-3xl leading-tight text-wine sm:text-4xl lg:text-5xl">{p.name}</h1>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {p.color && <span>Cor: {p.color}</span>}
            {p.sku && <span>SKU: {p.sku}</span>}
          </div>

          {(p.featured || p.best) && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-wine">
              <Sparkles className="h-3.5 w-3.5 text-champagne" />
              {p.featured ? "Em destaque na coleção REIS NOIR" : "Escolhida por +40 mulheres esta semana"}
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
              {lowStock && <p className="text-xs text-wine">Restam só {available} — corre</p>}
            </div>
            {productReviews.length > 0 && (
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {avgRating.toFixed(1)} · {productReviews.length} avaliação{productReviews.length > 1 ? "ões" : ""}
              </p>
            )}
            <div className={`mt-3 flex flex-wrap gap-2 ${sizeError ? "animate-pulse" : ""}`}>
              {p.sizes.map((s) => {
                const szStock = stockForSize(p, s);
                const soldOut = szStock < 1;
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={soldOut}
                    onClick={() => {
                      setSize(s);
                      setSizeError(false);
                      setQty(1);
                    }}
                    className={`h-11 min-w-12 border px-3 text-sm transition ${
                      soldOut
                        ? "cursor-not-allowed border-border text-muted-foreground line-through opacity-50"
                        : size === s
                          ? "border-wine bg-wine text-ivory"
                          : sizeError
                            ? "border-wine/60 text-wine"
                            : "border-border hover:border-wine/50"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {sizeError && <p className="mt-2 text-xs text-wine">Selecione um tamanho para garantir a modelagem certa.</p>}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex h-11 items-center border border-border">
              <button type="button" className="px-3 text-lg" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Diminuir">
                −
              </button>
              <span className="w-8 text-center text-sm">{qty}</span>
              <button type="button" className="px-3 text-lg" onClick={() => setQty((q) => Math.min(Math.max(1, available), q + 1))} aria-label="Aumentar">
                +
              </button>
            </div>
            <span className="text-xs text-muted-foreground">{available > 0 ? `${available} disponíveis` : "Esgotado"}</span>
          </div>

          <div className="mt-7 hidden flex-col gap-3 sm:flex">
            <button
              type="button"
              disabled={available < 1}
              onClick={() => add(true)}
              className="flex h-12 items-center justify-center gap-2 bg-wine px-6 text-[11px] tracking-[0.22em] text-ivory uppercase transition hover:bg-wine-deep disabled:opacity-40"
            >
              <Lock className="h-3.5 w-3.5 opacity-70" />
              Comprar agora — segurança REIS NOIR
            </button>
            <button
              type="button"
              disabled={available < 1}
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
              Frete grátis a partir de {brl(freeFrom)}
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

      <section className="border-t border-border px-6 py-12 md:px-16 lg:px-24">
        <h2 className="font-display text-2xl text-wine">Avaliações</h2>
        {productReviews.length > 0 ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {productReviews.map((r) => (
              <div key={r.id} className="flex gap-4 border border-[#e4d8cf] bg-white p-4">
                <img
                  src={reviewAvatar(r)}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-champagne/50 ring-offset-2 ring-offset-white"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">{r.author}</p>
                    <span className="inline-flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {r.rating}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-foreground/80">{r.text}</p>
                  <p className="mt-2 text-[11px] text-muted-foreground">{r.date}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">Seja a primeira a avaliar esta peça.</p>
        )}
        <form
          className="mt-8 max-w-lg space-y-3 border border-[#e4d8cf] bg-blush/30 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!revName.trim() || !revText.trim()) {
              toast.error("Preencha nome e comentário");
              return;
            }
            setReviews([
              {
                id: `r-${Date.now()}`,
                productId: p.id,
                author: revName.trim(),
                rating: revRating,
                text: revText.trim(),
                date: new Date().toISOString().slice(0, 10),
                approved: false,
              },
              ...reviews,
            ]);
            setRevName("");
            setRevText("");
            setRevRating(5);
            toast.success("Avaliação enviada — aparece após aprovação no painel");
          }}
        >
          <p className="text-sm font-medium text-wine">Deixe sua opinião</p>
          <input
            value={revName}
            onChange={(e) => setRevName(e.target.value)}
            placeholder="Seu nome"
            className="h-11 w-full border border-border bg-white px-3 text-sm outline-none focus:border-wine"
          />
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRevRating(n)} aria-label={`${n} estrelas`} className="p-1">
                <Star className={`h-5 w-5 ${n <= revRating ? "fill-amber-400 text-amber-400" : "text-zinc-300"}`} />
              </button>
            ))}
          </div>
          <textarea
            value={revText}
            onChange={(e) => setRevText(e.target.value)}
            placeholder="Como foi o caimento, o tecido, a entrega…"
            rows={3}
            className="w-full border border-border bg-white px-3 py-2 text-sm outline-none focus:border-wine"
          />
          <button type="submit" className="h-11 bg-wine px-5 text-[11px] tracking-[0.18em] text-ivory uppercase hover:bg-wine-deep">
            Enviar avaliação
          </button>
        </form>
      </section>

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
          <button type="button" disabled={available < 1} onClick={() => add(false)} className="h-12 flex-1 border border-wine text-[10px] tracking-wider text-wine uppercase disabled:opacity-40">
            Sacola
          </button>
          <button type="button" disabled={available < 1} onClick={() => add(true)} className="h-12 flex-[1.4] bg-wine text-[10px] tracking-wider text-ivory uppercase disabled:opacity-40">
            Comprar agora
          </button>
        </div>
      </div>
    </StoreLayout>
  );
}
