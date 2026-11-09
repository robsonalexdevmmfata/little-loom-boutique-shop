import { createFileRoute, Link } from "@tanstack/react-router";
import { StoreLayout } from "@/components/StoreLayout";
import { useFaq } from "@/lib/cms-extras";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — REIS NOIR" },
      { name: "description", content: "Perguntas frequentes sobre pedidos, trocas e entrega REIS NOIR." },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const [items] = useFaq();
  return (
    <StoreLayout>
      <div className="mx-auto max-w-3xl px-6 py-16 md:px-16">
        <p className="text-xs tracking-[0.2em] text-champagne uppercase">Ajuda</p>
        <h1 className="mt-2 font-display text-4xl text-wine">Perguntas frequentes</h1>
        <div className="mt-10 space-y-4">
          {items.map((item) => (
            <details key={item.id} className="group border border-[#e4d8cf] bg-white open:shadow-sm">
              <summary className="cursor-pointer list-none px-5 py-4 text-sm font-medium text-wine marker:content-none">
                {item.question}
              </summary>
              <div className="border-t border-[#f0e7df] px-5 py-4 text-sm text-foreground/80">{item.answer}</div>
            </details>
          ))}
          {items.length === 0 && <p className="text-sm text-muted-foreground">Em breve.</p>}
        </div>
        <p className="mt-10 text-sm">
          <Link to="/" className="underline">
            Voltar à loja
          </Link>
        </p>
      </div>
    </StoreLayout>
  );
}
