import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, CreditCard, Gem, Headphones, Truck } from "lucide-react";
import { useState } from "react";
import { StoreLayout } from "@/components/StoreLayout";
import { brl, categories, images, useProducts, useSettings } from "@/lib/store";
import editorial from "@/assets/editorial.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "REIS NOIR — Moda feminina premium" },
      { name: "description", content: "Conjuntos, vestidos, macacões e blazers em bordô. Elegância que chega no lugar." },
      { property: "og:title", content: "REIS NOIR — Moda feminina premium" },
      { property: "og:description", content: "Conjuntos, vestidos, macacões e blazers em bordô." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const slides = [images.hero, images.vestidos, images.blazers];
const benefits = [
  { icon: Gem, t: "Compra segura", s: "Seus dados protegidos" },
  { icon: Truck, t: "Envio para todo o Brasil", s: "Com rastreamento" },
  { icon: CreditCard, t: "Parcele em até 12x", s: "No cartão de crédito" },
  { icon: Headphones, t: "Atendimento especializado", s: "Estamos aqui para você" },
];

function Index() {
  const [s] = useSettings();
  const [products] = useProducts();
  const [i, setI] = useState(0);
  return (
    <StoreLayout overlay>
      <section className="relative grid min-h-[600px] overflow-hidden bg-wine md:grid-cols-2">
        <div className="relative z-10 flex flex-col justify-center px-8 pb-12 pt-32 md:px-32">
          <p className="mb-6 text-xs tracking-[0.5em] text-ivory/70">REIS NOIR</p>
          <h1 className="font-display text-5xl leading-[1.05] text-ivory md:text-6xl">
            {s.heroTitle} <em className="font-script text-champagne">{s.heroAccent}</em>
          </h1>
          <a href="#colecoes" className="mt-10 inline-flex w-fit items-center gap-3 border border-ivory px-8 py-3 text-xs tracking-[0.2em] text-ivory uppercase hover:bg-ivory hover:text-wine-deep">
            {s.heroButton} <ArrowRight className="h-3 w-3" />
          </a>
        </div>
        <div className="relative min-h-[400px]">
          <img src={slides[i]} alt="Modelo REIS NOIR" className="absolute inset-0 h-full w-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-r from-wine via-wine/20 to-transparent" />
          <div className="absolute bottom-6 right-10 flex items-center gap-6 text-sm text-ivory">
            <button aria-label="Anterior" onClick={() => setI((i + 2) % 3)}><ChevronLeft /></button>
            <span>{i + 1} / 3</span>
            <button aria-label="Próximo" onClick={() => setI((i + 1) % 3)}><ChevronRight /></button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-6 border-t border-ivory/10 bg-wine-deep px-6 py-6 text-ivory md:grid-cols-4 md:px-16">
        {benefits.map((b) => (
          <div key={b.t} className="flex items-center gap-4">
            <b.icon className="h-8 w-8 shrink-0 text-ivory/80" strokeWidth={1} />
            <div><p className="font-display">{b.t}</p><p className="text-xs text-ivory/60">{b.s}</p></div>
          </div>
        ))}
      </section>

      <section id="colecoes" className="bg-blush px-4 py-10">
        <p className="text-center text-xs tracking-[0.5em] text-wine">NOSSAS COLEÇÕES</p>
        <div className="mb-8 flex items-center gap-8 px-10">
          <span className="h-px flex-1 bg-wine/40" />
          <h2 className="font-display text-3xl text-wine md:text-4xl">Descubra o seu próximo favorito</h2>
          <span className="h-px flex-1 bg-wine/40" />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {categories.map((c) => (
            <a key={c.name} href="#novidades" className="group relative aspect-[286/214] overflow-hidden">
              <img src={c.image} alt={c.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-wine-deep/70 to-transparent" />
              <div className="absolute bottom-4 left-4 text-ivory">
                <p className="font-display text-xl">{c.name}</p>
                <p className="flex items-center gap-1 text-xs">Ver coleção <ArrowRight className="h-3 w-3" /></p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section id="novidades" className="bg-background px-6 py-14 md:px-16">
        <h2 className="mb-8 text-center font-display text-3xl text-wine">Novidades & Mais vendidos</h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
          {products.filter((p) => p.status === "publicado").map((p) => {
            const final = p.promo ?? p.price;
            return (
              <Link key={p.id} to="/produto/$slug" params={{ slug: p.slug }} className="group">
                <div className="relative aspect-[3/4] overflow-hidden bg-blush">
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                  <div className="absolute left-2 top-2 flex flex-col gap-1">
                    {p.isNew && <span className="bg-wine px-2 py-0.5 text-[10px] text-ivory">NOVO</span>}
                    {p.best && <span className="bg-champagne px-2 py-0.5 text-[10px] text-wine-deep">MAIS VENDIDO</span>}
                    {p.promo && <span className="bg-ivory px-2 py-0.5 text-[10px] text-wine">-{Math.round((1 - p.promo / p.price) * 100)}%</span>}
                  </div>
                </div>
                <p className="mt-3 text-sm">{p.name}</p>
                <p className="text-sm">
                  {p.promo && <span className="mr-2 text-muted-foreground line-through">{brl(p.price)}</span>}
                  <strong className="text-wine">{brl(final)}</strong>
                </p>
                <p className="text-xs text-muted-foreground">12x de {brl(final / 12)}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="relative flex min-h-[340px] items-center overflow-hidden bg-wine-deep">
        <img src={editorial.url} alt="" className="absolute inset-0 h-full w-full object-cover object-right" />
        <div className="absolute inset-0 bg-gradient-to-r from-wine-deep via-wine-deep/40 to-transparent" />
        <div className="relative px-8 md:px-28">
          <h2 className="max-w-sm font-script text-5xl leading-tight text-ivory">{s.editorialTitle}</h2>
          <p className="mt-4 text-xs tracking-[0.5em] text-ivory/70">REIS NOIR</p>
          <a href="#sobre" className="mt-6 inline-flex items-center gap-3 border border-ivory px-8 py-3 text-xs tracking-[0.2em] text-ivory uppercase">Conheça a marca <ArrowRight className="h-3 w-3" /></a>
        </div>
      </section>
    </StoreLayout>
  );
}
