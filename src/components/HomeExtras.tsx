import { Link } from "@tanstack/react-router";
import { ArrowRight, Star } from "lucide-react";
import { reviewAvatar, useFaq, useReviews } from "@/lib/cms-extras";
import { useProducts } from "@/lib/store";

/** Seções da home ligadas ao CMS: avaliações + FAQ. */
export function HomeExtras() {
  const [reviews] = useReviews();
  const [faq] = useFaq();
  const [products] = useProducts();

  const approved = reviews.filter((r) => r.approved).slice(0, 6);
  const faqPreview = faq.slice(0, 4);

  const productName = (id: string) => products.find((p) => p.id === id)?.name ?? "Peça REIS NOIR";
  const productSlug = (id: string) => products.find((p) => p.id === id)?.slug;

  if (approved.length === 0 && faqPreview.length === 0) return null;

  return (
    <>
      {approved.length > 0 && (
        <section id="depoimentos" className="border-t border-border bg-blush/50 px-6 py-16 md:px-16">
          <p className="text-center text-[11px] tracking-[0.4em] text-wine/70 uppercase">Quem vestiu</p>
          <h2 className="mt-2 text-center font-display text-3xl text-wine md:text-4xl">Avaliações</h2>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {approved.map((r) => {
              const slug = productSlug(r.productId);
              return (
                <article key={r.id} className="flex flex-col items-center border border-[#e4d8cf] bg-white px-6 py-8 text-center shadow-[0_12px_40px_rgba(61,20,24,0.04)]">
                  <img
                    src={reviewAvatar(r)}
                    alt=""
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-champagne/60 ring-offset-2 ring-offset-white"
                    loading="lazy"
                  />
                  <div className="mt-4 flex items-center justify-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-zinc-200"}`} />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-foreground/85">“{r.text}”</p>
                  <p className="mt-5 text-sm font-medium text-wine">{r.author}</p>
                  {slug ? (
                    <Link to="/produto/$slug" params={{ slug }} className="mt-1 text-[11px] text-muted-foreground hover:text-wine hover:underline">
                      {productName(r.productId)}
                    </Link>
                  ) : (
                    <p className="mt-1 text-[11px] text-muted-foreground">{productName(r.productId)}</p>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {faqPreview.length > 0 && (
        <section id="ajuda" className="bg-background px-6 py-16 md:px-16">
          <div className="mx-auto max-w-3xl">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] tracking-[0.4em] text-wine/70 uppercase">Dúvidas</p>
                <h2 className="mt-2 font-display text-3xl text-wine">Perguntas frequentes</h2>
              </div>
              <Link to="/faq" className="inline-flex items-center gap-2 text-sm text-wine hover:underline">
                Ver todas <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-8 space-y-3">
              {faqPreview.map((item) => (
                <details key={item.id} className="group border border-[#e4d8cf] bg-white open:shadow-sm">
                  <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium text-wine marker:content-none">
                    {item.question}
                  </summary>
                  <div className="border-t border-[#f0e7df] px-5 py-4 text-sm text-foreground/80">{item.answer}</div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
