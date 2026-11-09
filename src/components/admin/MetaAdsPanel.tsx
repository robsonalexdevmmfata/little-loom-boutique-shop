import { CheckCircle2, Copy, Download, ExternalLink, Megaphone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { exportMetaCatalogCsv, useMetaAds } from "@/lib/meta-ads";
import { useProducts } from "@/lib/store";
import { Field, PageHeader, Panel, field } from "./shared";

function copyText(text: string, label: string) {
  void navigator.clipboard.writeText(text);
  toast.success(`${label} copiado`);
}

export function MetaAdsPanel() {
  const [meta, setMeta] = useMetaAds();
  const [products] = useProducts();
  const [saved, setSaved] = useState(false);
  const siteUrl = "https://little-loom-boutique-shop.vercel.app";
  const pixelReady = meta.enabled && Boolean(meta.pixelId.trim());

  const persist = (next: typeof meta) => {
    setMeta(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1000);
    toast.success("Meta Ads salvo");
  };

  return (
    <div>
      <PageHeader
        title="Meta Ads"
        subtitle="Facebook · Instagram · Pixel · Catálogo para anúncios"
        actions={
          saved ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Salvo
            </span>
          ) : pixelReady ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">Pixel ativo</span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800">Configure o Pixel</span>
          )
        }
      />

      <Panel className="overflow-hidden border-blue-200/80">
        <div className="border-b border-blue-100 bg-gradient-to-r from-[#1877F2]/10 to-transparent px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#1877F2] text-white">
              <Megaphone className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-zinc-900">Anúncios Facebook & Instagram</h2>
              <p className="mt-0.5 text-sm text-zinc-600">Cole o Pixel, baixe o feed e rode campanhas com o catálogo da REIS NOIR</p>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
            <p className="text-sm font-semibold text-zinc-900">O que pegar no Meta Business</p>
            <p className="mt-1 text-xs text-zinc-600">
              Entre em{" "}
              <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" className="font-medium text-[#1877F2] hover:underline">
                business.facebook.com
              </a>{" "}
              e copie:
            </p>
            <ol className="mt-3 space-y-3 text-sm text-zinc-700">
              <li className="rounded-lg border border-white bg-white/80 px-3 py-2.5">
                <p className="font-semibold text-zinc-900">1. ID do Pixel (obrigatório)</p>
                <p className="mt-1 text-xs text-zinc-600">Gerenciador de Eventos → Fontes de dados → Pixel → copiar o ID (só números).</p>
              </li>
              <li className="rounded-lg border border-white bg-white/80 px-3 py-2.5">
                <p className="font-semibold text-zinc-900">2. ID do Catálogo (anúncios dinâmicos)</p>
                <p className="mt-1 text-xs text-zinc-600">Commerce Manager → Catálogos → ID do catálogo.</p>
              </li>
              <li className="rounded-lg border border-white bg-white/80 px-3 py-2.5">
                <p className="font-semibold text-zinc-900">3. Feed CSV de produtos</p>
                <p className="mt-1 text-xs text-zinc-600">Baixe abaixo e suba como fonte de dados do catálogo.</p>
              </li>
              <li className="rounded-lg border border-white bg-white/80 px-3 py-2.5">
                <p className="font-semibold text-zinc-900">4. Verificar domínio</p>
                <p className="mt-1 text-xs text-zinc-600">
                  Domínios da marca →{" "}
                  <button type="button" className="font-mono text-[11px] text-[#1877F2] hover:underline" onClick={() => copyText("little-loom-boutique-shop.vercel.app", "Domínio")}>
                    little-loom-boutique-shop.vercel.app
                  </button>
                </p>
              </li>
            </ol>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href="https://business.facebook.com/events_manager2"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#1877F2] px-3 text-xs font-medium text-white hover:bg-[#166fe5]"
              >
                Gerenciador de Eventos <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="https://business.facebook.com/commerce_manager"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Commerce Manager <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="https://adsmanager.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Gerenciador de Anúncios <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-zinc-900">Ativar Pixel na loja</p>
              <p className="text-xs text-zinc-500">PageView · ViewContent · AddToCart · Purchase</p>
            </div>
            <Switch checked={meta.enabled} onCheckedChange={(v) => persist({ ...meta, enabled: v })} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="ID do Pixel" hint="obrigatório" value={meta.pixelId} onChange={(v) => persist({ ...meta, pixelId: v.replace(/\D/g, "") })} />
            <Field label="ID do Catálogo" hint="opcional" value={meta.catalogId} onChange={(v) => persist({ ...meta, catalogId: v.trim() })} />
            <Field label="ID do conjunto de dados" hint="opcional" value={meta.datasetId} onChange={(v) => persist({ ...meta, datasetId: v.trim() })} />
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-600">URL da loja</span>
              <div className="flex gap-2">
                <input className={field} readOnly value={siteUrl} />
                <button type="button" onClick={() => copyText(siteUrl, "URL")} className="inline-flex h-10 shrink-0 items-center gap-1 rounded-md border border-zinc-200 px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50">
                  <Copy className="h-3.5 w-3.5" /> Copiar
                </button>
              </div>
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-zinc-600">Anotações internas</span>
            <textarea
              className="min-h-[72px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-wine focus:ring-2 focus:ring-wine/15"
              value={meta.notes}
              onChange={(e) => persist({ ...meta, notes: e.target.value })}
              placeholder="Ex.: campanha remarketing vestidos · conta Ads da loja"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-zinc-900">Feed de catálogo Meta</p>
              <p className="text-xs text-zinc-500">{products.filter((p) => p.status === "publicado").length} produtos publicados</p>
            </div>
            <button
              type="button"
              onClick={() => {
                exportMetaCatalogCsv(products);
                toast.success("CSV do catálogo baixado");
              }}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-zinc-900 px-3 text-xs font-medium text-white hover:bg-zinc-800"
            >
              <Download className="h-3.5 w-3.5" /> Baixar feed CSV
            </button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
