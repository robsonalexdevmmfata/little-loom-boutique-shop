import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, CreditCard, Gem, Headphones, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import sPrincipal from "@/assets/slide_principal.jpg";
import sVestido from "@/assets/slide_vestido.jpg";
import sConjunto from "@/assets/slide_conjunto.jpg";
import sBlazer from "@/assets/slide_blazer.jpg";
import sMacacao from "@/assets/slide_macacao.jpg";
import { StoreLayout } from "@/components/StoreLayout";
import { brl, useCatalog, useProducts, useSettings } from "@/lib/store";
import editorial from "@/assets/editorial.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "REIS NOIR — Moda feminina premium" },
      { name: "description", content: "Conjuntos, vestidos, macacões e blazers em bordô. Elegância que chega no lugar." },
      { property: "og:title", content: "REIS NOIR — Moda feminina premium" },
      { property: "og:description", content: "Conjuntos, vestidos, macacões e blazers em bordô." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://little-loom-boutique-shop.vercel.app/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://little-loom-boutique-shop.vercel.app/og-image.jpg" },
    ],
  }),
  component: Index,
});

const slideMedia = [
  { img: sPrincipal, alt: "Vestido gola alta bordô", pos: "object-[72%_20%]", href: "#colecoes" },
  { img: sVestido, alt: "Vestido midi com capa", pos: "object-[72%_15%]", href: "#novidades" },
  { img: sConjunto, alt: "Conjunto tomara que caia", pos: "object-[72%_15%]", href: "#novidades" },
  { img: sBlazer, alt: "Blazer oversized marsala", pos: "object-[75%_20%]", href: "#novidades" },
  { img: sMacacao, alt: "Macacão frente única", pos: "object-[72%_15%]", href: "#novidades" },
];

const benefitIcons = [Gem, Truck, CreditCard, Headphones];

function Index() {
  const [s] = useSettings();
  const [products] = useProducts();
  const [catalog] = useCatalog();
  const [i, setI] = useState(0);
  const [cat, setCat] = useState("Todas");
  const [sub, setSub] = useState("Todas");
  const [place, setPlace] = useState<"vitrine" | "destaques" | "novidades" | "mais-vendidos">("vitrine");

  const slides = slideMedia.map((media, k) => {
    if (k === 0) {
      return {
        ...media,
        kicker: s.heroKicker,
        title: s.heroTitle,
        accent: s.heroAccent,
        text: "",
        button: s.heroButton,
      };
    }
    const copy = s.slides[k - 1] ?? { kicker: "", title: "", accent: "", text: "", button: "" };
    return { ...media, ...copy };
  });

  const go = (d: number) => setI((p) => (p + d + slides.length) % slides.length);
  const published = products.filter((p) => p.status === "publicado");
  const byPlace = published.filter((p) => {
    if (place === "destaques") return !!p.featured;
    if (place === "novidades") return !!p.isNew;
    if (place === "mais-vendidos") return !!p.best;
    return p.showInVitrine !== false;
  });
  const byCat = cat === "Todas" ? byPlace : byPlace.filter((p) => p.category === cat);
  const filtered = sub === "Todas" || cat === "Todas" ? byCat : byCat.filter((p) => p.subcategory === sub);
  const catFilters = ["Todas", ...catalog.map((c) => c.name)];
  const placeFilters = [
    { id: "vitrine" as const, label: "Vitrine" },
    { id: "destaques" as const, label: "Destaques" },
    { id: "novidades" as const, label: "Novidades" },
    { id: "mais-vendidos" as const, label: "Mais vendidos" },
  ];
  const subFilters = cat === "Todas" ? [] : ["Todas", ...(catalog.find((c) => c.name === cat)?.subcategories ?? [])];

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % slideMedia.length), 6000);
    return () => clearInterval(t);
  }, [i]);

  return (
    <StoreLayout overlay>
      <section className="relative h-[100svh] max-h-[900px] min-h-[560px] overflow-hidden bg-wine">
        {slides.map((sl, k) => (
          <div key={k} className={`absolute inset-0 transition-opacity duration-1000 ${k === i ? "opacity-100" : "pointer-events-none opacity-0"}`} aria-hidden={k !== i}>
            <img src={sl.img} alt={sl.alt} className={`absolute inset-0 h-full w-full object-cover ${sl.pos}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-wine-deep via-wine-deep/40 to-transparent md:bg-gradient-to-r md:from-wine-deep/90 md:via-wine-deep/30" />
            <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-24 sm:px-10 md:justify-center md:px-20 md:pb-0 md:pt-24 lg:px-32">
              <p className="mb-4 text-[10px] tracking-[0.5em] text-ivory/70 sm:text-xs">{sl.kicker}</p>
              <h2 className="max-w-[14ch] font-display text-4xl leading-[1.05] text-ivory sm:text-5xl lg:text-6xl xl:text-7xl">
                {sl.title} <em className="font-script text-champagne">{sl.accent}</em>
              </h2>
              {sl.text && <p className="mt-4 max-w-md text-sm text-ivory/80 sm:text-base">{sl.text}</p>}
              <a
                href={sl.href}
                className="mt-8 inline-flex w-fit items-center gap-3 border border-ivory px-6 py-3 text-[10px] tracking-[0.2em] text-ivory uppercase transition hover:bg-ivory hover:text-wine-deep sm:px-8 sm:text-xs"
              >
                {sl.button} <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        ))}
        <div className="absolute bottom-6 left-6 z-20 flex gap-2 sm:left-10 md:left-20 lg:left-32">
          {slides.map((_, k) => (
            <button key={k} aria-label={`Slide ${k + 1}`} onClick={() => setI(k)} className={`h-[2px] transition-all ${k === i ? "w-10 bg-champagne" : "w-5 bg-ivory/40"}`} />
          ))}
        </div>
        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-4 text-sm text-ivory sm:right-10">
          <button aria-label="Anterior" onClick={() => go(-1)} className="p-1">
            <ChevronLeft />
          </button>
          <span>
            {i + 1} / {slides.length}
          </span>
          <button aria-label="Próximo" onClick={() => go(1)} className="p-1">
            <ChevronRight />
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 border-t border-ivory/10 bg-wine-deep px-6 py-6 text-ivory sm:grid-cols-2 md:px-16 lg:grid-cols-4">
        {s.benefits.map((b, idx) => {
          const Icon = benefitIcons[idx] ?? Gem;
          return (
            <div key={`${b.title}-${idx}`} className="flex items-center gap-4">
              <Icon className="h-8 w-8 shrink-0 text-ivory/80" strokeWidth={1} />
              <div>
                <p className="font-display">{b.title}</p>
                <p className="text-xs text-ivory/60">{b.subtitle}</p>
              </div>
            </div>
          );
        })}
      </section>

      <section id="colecoes" className="bg-blush px-4 py-10">
        <p className="text-center text-xs tracking-[0.5em] text-wine">{s.collectionsEyebrow}</p>
        <div className="mb-8 flex items-center gap-4 px-2 sm:gap-8 sm:px-10">
          <span className="hidden h-px flex-1 bg-wine/40 sm:block" />
          <h2 className="w-full text-center font-display text-2xl text-wine sm:w-auto sm:text-3xl md:text-4xl">{s.collectionsTitle}</h2>
          <span className="hidden h-px flex-1 bg-wine/40 sm:block" />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {catalog.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => {
                setCat(c.name);
                setSub("Todas");
                setPlace("vitrine");
                document.getElementById("novidades")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group relative aspect-[3/4] overflow-hidden text-left"
            >
              <img src={c.image} alt={c.name} className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-wine-deep/70 to-transparent" />
              <div className="absolute bottom-4 left-4 text-ivory">
                <p className="font-display text-xl">{c.name}</p>
                <p className="flex items-center gap-1 text-xs">
                  Ver coleção <ArrowRight className="h-3 w-3" />
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section id="novidades" className="bg-background px-6 py-14 md:px-16">
        <h2 className="mb-3 text-center font-display text-3xl text-wine">{s.productsTitle}</h2>
        <p className="mb-6 text-center text-sm text-muted-foreground">{filtered.length} peças disponíveis</p>

        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {placeFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setPlace(f.id)}
              className={`px-4 py-2 text-[11px] tracking-[0.15em] uppercase transition ${place === f.id ? "bg-wine text-ivory" : "border border-border text-wine hover:border-wine"}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {catFilters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                setCat(f);
                setSub("Todas");
              }}
              className={`px-3 py-1.5 text-[11px] tracking-[0.12em] uppercase transition ${cat === f ? "border border-wine bg-blush text-wine" : "text-muted-foreground hover:text-wine"}`}
            >
              {f}
            </button>
          ))}
        </div>

        {subFilters.length > 1 && (
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {subFilters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setSub(f)}
                className={`px-3 py-1 text-[10px] tracking-wide uppercase transition ${sub === f ? "bg-champagne text-wine-deep" : "border border-border/70 text-muted-foreground hover:border-wine/40"}`}
              >
                {f === "Todas" ? "Todas subcategorias" : f}
              </button>
            ))}
          </div>
        )}

        <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 ${subFilters.length <= 1 ? "mt-4" : ""}`}>
          {filtered.map((p) => {
            const final = p.promo ?? p.price;
            return (
              <Link key={p.id} to="/produto/$slug" params={{ slug: p.slug }} className="group">
                <div className="relative aspect-[3/4] overflow-hidden bg-blush">
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover object-[78%_0%] transition group-hover:scale-105" />
                  <div className="absolute left-2 top-2 flex flex-col gap-1">
                    {p.featured && <span className="bg-champagne px-2 py-0.5 text-[10px] text-wine-deep">DESTAQUE</span>}
                    {p.isNew && <span className="bg-wine px-2 py-0.5 text-[10px] text-ivory">NOVO</span>}
                    {p.best && <span className="bg-ivory px-2 py-0.5 text-[10px] text-wine">MAIS VENDIDO</span>}
                    {p.promo && <span className="bg-ivory/90 px-2 py-0.5 text-[10px] text-wine">-{Math.round((1 - p.promo / p.price) * 100)}%</span>}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 translate-y-full bg-wine/90 py-2 text-center text-[10px] tracking-wider text-ivory uppercase transition group-hover:translate-y-0">
                    Ver detalhes
                  </div>
                </div>
                <p className="mt-3 text-sm">{p.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {p.subcategory ? `${p.subcategory}` : p.category}
                  {p.color ? ` · ${p.color}` : ""}
                </p>
                <p className="text-sm">
                  {p.promo && <span className="mr-2 text-muted-foreground line-through">{brl(p.price)}</span>}
                  <strong className="text-wine">{brl(final)}</strong>
                </p>
                <p className="text-xs text-muted-foreground">12x de {brl(final / 12)}</p>
              </Link>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <p className="mt-10 text-center text-sm text-muted-foreground">Nenhuma peça neste filtro. Ajuste vitrine/destaques no admin.</p>
        )}
      </section>

      <section className="relative flex min-h-[340px] items-center overflow-hidden bg-wine-deep">
        <img src={editorial.url} alt="" className="absolute inset-0 h-full w-full object-cover object-right" />
        <div className="absolute inset-0 bg-gradient-to-r from-wine-deep via-wine-deep/40 to-transparent" />
        <div className="relative px-8 md:px-28">
          <h2 className="max-w-sm font-script text-5xl leading-tight text-ivory">{s.editorialTitle}</h2>
          <p className="mt-4 text-xs tracking-[0.5em] text-ivory/70">{s.editorialKicker}</p>
          <a href="#sobre" className="mt-6 inline-flex items-center gap-3 border border-ivory px-8 py-3 text-xs tracking-[0.2em] text-ivory uppercase">
            {s.editorialButton} <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      </section>
    </StoreLayout>
  );
}
