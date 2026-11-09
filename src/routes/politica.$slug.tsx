import { createFileRoute, Link } from "@tanstack/react-router";
import { StoreLayout } from "@/components/StoreLayout";
import { useSettings } from "@/lib/store";

const MAP = {
  privacidade: { titleKey: "footerPolicy1", bodyKey: "policyBody1" },
  trocas: { titleKey: "footerPolicy2", bodyKey: "policyBody2" },
  entrega: { titleKey: "footerPolicy3", bodyKey: "policyBody3" },
} as const;

export const Route = createFileRoute("/politica/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Política — REIS NOIR` },
      { name: "description", content: `Política ${params.slug} da loja REIS NOIR.` },
    ],
  }),
  component: PolicyPage,
});

function PolicyPage() {
  const { slug } = Route.useParams();
  const [s] = useSettings();
  const key = slug as keyof typeof MAP;
  const meta = MAP[key];

  if (!meta) {
    return (
      <StoreLayout>
        <p className="p-20 text-center">
          Política não encontrada.{" "}
          <Link to="/" className="underline">
            Voltar
          </Link>
        </p>
      </StoreLayout>
    );
  }

  const title = s[meta.titleKey];
  const body = s[meta.bodyKey] ?? "";

  return (
    <StoreLayout>
      <article className="mx-auto max-w-3xl px-6 py-16 md:px-16">
        <p className="text-xs tracking-[0.2em] text-champagne uppercase">{s.footerPoliciesTitle}</p>
        <h1 className="mt-2 font-display text-4xl text-wine">{title}</h1>
        <div className="mt-8 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">{body}</div>
        <div className="mt-10 flex flex-wrap gap-4 text-sm">
          <Link to="/politica/$slug" params={{ slug: "privacidade" }} className="underline">
            {s.footerPolicy1}
          </Link>
          <Link to="/politica/$slug" params={{ slug: "trocas" }} className="underline">
            {s.footerPolicy2}
          </Link>
          <Link to="/politica/$slug" params={{ slug: "entrega" }} className="underline">
            {s.footerPolicy3}
          </Link>
          <Link to="/faq" className="underline">
            FAQ
          </Link>
        </div>
      </article>
    </StoreLayout>
  );
}
