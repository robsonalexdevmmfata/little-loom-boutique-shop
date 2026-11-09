import { useState } from "react";
import { toast } from "sonner";
import { useSeo } from "@/lib/cms-extras";
import { useProducts } from "@/lib/store";
import { Field, PageHeader, Panel } from "./shared";

export function SeoPanel() {
  const [seo, setSeo] = useSeo();
  const [products, setProducts] = useProducts();
  const [pick, setPick] = useState(products[0]?.id ?? "");

  const p = products.find((x) => x.id === pick);

  const persist = (next: typeof seo) => {
    setSeo(next);
    toast.success("SEO salvo");
  };

  return (
    <div>
      <PageHeader title="SEO" subtitle="Títulos, descrições e prévia estilo Google" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="space-y-3 p-5">
          <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">Home</p>
          <Field label="Title" value={seo.homeTitle} onChange={(v) => persist({ ...seo, homeTitle: v })} />
          <Field label="Meta description" value={seo.homeDescription} onChange={(v) => persist({ ...seo, homeDescription: v })} multiline />
          <Field label="Sufixo nos produtos" value={seo.productTitleSuffix} onChange={(v) => persist({ ...seo, productTitleSuffix: v })} />
          <Field label="OG image URL" value={seo.defaultOgImage} onChange={(v) => persist({ ...seo, defaultOgImage: v })} />
        </Panel>
        <Panel className="space-y-3 p-5">
          <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">Prévia Google</p>
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <p className="truncate text-xl text-[#1a0dab]">{seo.homeTitle || "Título da home"}</p>
            <p className="truncate text-sm text-[#006621]">reisnoir.com.br</p>
            <p className="mt-1 line-clamp-2 text-sm text-zinc-600">{seo.homeDescription}</p>
          </div>
          <p className="pt-2 text-xs font-semibold tracking-wide text-zinc-500 uppercase">SEO do produto</p>
          <select className="h-10 w-full rounded-md border border-zinc-200 px-3 text-sm" value={pick} onChange={(e) => setPick(e.target.value)}>
            {products.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
          {p && (
            <>
              <Field
                label="Title do produto"
                value={p.seoTitle ?? ""}
                onChange={(v) => setProducts(products.map((x) => (x.id === p.id ? { ...x, seoTitle: v } : x)))}
                hint={`Ex.: ${p.name} ${seo.productTitleSuffix}`}
              />
              <Field
                label="Description do produto"
                value={p.seoDescription ?? ""}
                onChange={(v) => setProducts(products.map((x) => (x.id === p.id ? { ...x, seoDescription: v } : x)))}
                multiline
              />
              <div className="rounded-lg border border-zinc-200 bg-white p-4">
                <p className="truncate text-xl text-[#1a0dab]">{p.seoTitle || `${p.name} ${seo.productTitleSuffix}`}</p>
                <p className="truncate text-sm text-[#006621]">reisnoir.com.br/produto/{p.slug}</p>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-600">{p.seoDescription || p.description}</p>
              </div>
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}
