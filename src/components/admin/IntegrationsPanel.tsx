import { CheckCircle2, Copy, Download, ExternalLink, Plug, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { getMpPublicKey } from "@/integrations/mercado-pago";
import { exportMetaCatalogCsv, useMetaAds } from "@/lib/meta-ads";
import { useProducts } from "@/lib/store";
import { Field, PageHeader, Panel, field } from "./shared";

type Status = "loading" | "ok" | "off";

function StatusBadge({ status }: { status: Status }) {
  if (status === "loading") return <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500">Checando…</span>;
  if (status === "ok")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
        <CheckCircle2 className="h-3 w-3" /> Conectado
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800">
      <XCircle className="h-3 w-3" /> Pendente
    </span>
  );
}

function copyText(text: string, label: string) {
  void navigator.clipboard.writeText(text);
  toast.success(`${label} copiado`);
}

export function IntegrationsPanel() {
  const [mp, setMp] = useState<Status>("loading");
  const [mpKey, setMpKey] = useState("");
  const [mpConfigured, setMpConfigured] = useState(false);
  const [meta, setMeta] = useMetaAds();
  const [products] = useProducts();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let alive = true;
    getMpPublicKey()
      .then((r) => {
        if (!alive) return;
        setMpKey(r.publicKey || "");
        setMpConfigured(Boolean(r.configured));
        setMp(r.publicKey || r.configured ? "ok" : "off");
      })
      .catch(() => {
        if (!alive) return;
        setMp("off");
      });
    return () => {
      alive = false;
    };
  }, []);

  const persistMeta = (next: typeof meta) => {
    setMeta(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1000);
    toast.success("Meta Ads salvo");
  };

  const pixelReady = meta.enabled && Boolean(meta.pixelId.trim());
  const siteUrl = "https://little-loom-boutique-shop.vercel.app";

  return (
    <div>
      <PageHeader
        title="Integrações"
        subtitle="Pagamentos, frete, Meta Ads e canais da loja"
        actions={
          saved ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Salvo
            </span>
          ) : null
        }
      />

      <div className="space-y-5">
        <Panel className="overflow-hidden border-blue-200/80">
          <div className="border-b border-blue-100 bg-gradient-to-r from-[#1877F2]/10 to-transparent px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#1877F2] text-white">
                  <Plug className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-zinc-900">Meta Ads (Facebook / Instagram)</h2>
                  <p className="mt-0.5 text-sm text-zinc-600">Pixel + catálogo para anúncios e remarketing</p>
                </div>
              </div>
              <StatusBadge status={pixelReady ? "ok" : "off"} />
            </div>
          </div>

          <div className="space-y-5 p-5">
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <p className="text-sm font-semibold text-zinc-900">O que você precisa pegar no Meta</p>
              <p className="mt-1 text-xs text-zinc-600">Entre em{" "}
                <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" className="font-medium text-[#1877F2] hover:underline">
                  business.facebook.com
                </a>{" "}
                com a conta da loja e copie estes itens:
              </p>
              <ol className="mt-3 space-y-3 text-sm text-zinc-700">
                <li className="rounded-lg border border-white bg-white/80 px-3 py-2.5">
                  <p className="font-semibold text-zinc-900">1. ID do Pixel (obrigatório)</p>
                  <p className="mt-1 text-xs text-zinc-600">
                    Gerenciador de Eventos → Fontes de dados → Pixel → copiar o <strong>ID</strong> (só números, ~15–16 dígitos).
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-500">Caminho: Eventos → Configurações → ID do conjunto de dados / Pixel</p>
                </li>
                <li className="rounded-lg border border-white bg-white/80 px-3 py-2.5">
                  <p className="font-semibold text-zinc-900">2. ID do Catálogo (para anúncios dinâmicos)</p>
                  <p className="mt-1 text-xs text-zinc-600">
                    Commerce Manager → Catálogos → selecione o catálogo → copiar o <strong>ID do catálogo</strong>.
                  </p>
                </li>
                <li className="rounded-lg border border-white bg-white/80 px-3 py-2.5">
                  <p className="font-semibold text-zinc-900">3. Feed de produtos (CSV)</p>
                  <p className="mt-1 text-xs text-zinc-600">
                    Baixe o CSV desta tela e suba no Commerce Manager (fonte de dados do catálogo). Atualize quando mudar o estoque.
                  </p>
                </li>
                <li className="rounded-lg border border-white bg-white/80 px-3 py-2.5">
                  <p className="font-semibold text-zinc-900">4. Domínio da loja (verificação)</p>
                  <p className="mt-1 text-xs text-zinc-600">
                    Configurações do negócio → Domínios da marca → adicionar e verificar:{" "}
                    <button type="button" className="font-mono text-[11px] text-[#1877F2] hover:underline" onClick={() => copyText(siteUrl.replace("https://", ""), "Domínio")}>
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
                  Abrir Gerenciador de Eventos <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href="https://business.facebook.com/commerce_manager"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Commerce Manager <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-zinc-900">Ativar Pixel na loja</p>
                <p className="text-xs text-zinc-500">Dispara PageView, ViewContent, AddToCart e Purchase</p>
              </div>
              <Switch checked={meta.enabled} onCheckedChange={(v) => persistMeta({ ...meta, enabled: v })} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="ID do Pixel"
                hint="obrigatório"
                value={meta.pixelId}
                onChange={(v) => persistMeta({ ...meta, pixelId: v.replace(/\D/g, "") })}
              />
              <Field
                label="ID do Catálogo"
                hint="opcional"
                value={meta.catalogId}
                onChange={(v) => persistMeta({ ...meta, catalogId: v.trim() })}
              />
              <Field
                label="ID do conjunto de dados"
                hint="opcional · Eventos"
                value={meta.datasetId}
                onChange={(v) => persistMeta({ ...meta, datasetId: v.trim() })}
              />
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-zinc-600">URL da loja (para o feed)</span>
                <div className="flex gap-2">
                  <input className={field} readOnly value={siteUrl} />
                  <button
                    type="button"
                    onClick={() => copyText(siteUrl, "URL")}
                    className="inline-flex h-10 shrink-0 items-center gap-1 rounded-md border border-zinc-200 px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                  >
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
                onChange={(e) => persistMeta({ ...meta, notes: e.target.value })}
                placeholder="Ex.: Pixel da conta Agencia Info · campanha remarketing vestidos"
              />
            </label>

            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-900">Feed de catálogo Meta</p>
                <p className="text-xs text-zinc-500">
                  {products.filter((p) => p.status === "publicado").length} produtos publicados · formato CSV Commerce
                </p>
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

            <div className="rounded-lg border border-zinc-200 px-4 py-3 text-xs text-zinc-600">
              <p className="font-medium text-zinc-800">Eventos que a loja envia automaticamente</p>
              <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                <li>
                  <code className="rounded bg-zinc-100 px-1">PageView</code> — qualquer página
                </li>
                <li>
                  <code className="rounded bg-zinc-100 px-1">ViewContent</code> — página do produto
                </li>
                <li>
                  <code className="rounded bg-zinc-100 px-1">AddToCart</code> — adicionar à sacola
                </li>
                <li>
                  <code className="rounded bg-zinc-100 px-1">Purchase</code> — pedido finalizado
                </li>
              </ul>
              <p className="mt-2 text-zinc-500">
                Depois de colar o Pixel e ativar, teste em Eventos → Testar eventos (com a loja aberta).
              </p>
            </div>
          </div>
        </Panel>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel className="p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-sky-50 text-sky-700">
                  <Plug className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900">Mercado Pago</h2>
                  <p className="text-xs text-zinc-500">Checkout transparente · cartão, PIX e boleto</p>
                </div>
              </div>
              <StatusBadge status={mp} />
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3 border-t border-zinc-100 pt-2">
                <dt className="text-zinc-500">Public key</dt>
                <dd className="truncate font-mono text-xs text-zinc-800">{mpKey ? `${mpKey.slice(0, 14)}…` : "não definida"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-zinc-500">Access token</dt>
                <dd className="text-zinc-800">{mpConfigured ? "configurado no servidor" : "pendente"}</dd>
              </div>
            </dl>
            <a
              href="https://www.mercadopago.com.br/developers/panel"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-wine hover:underline"
            >
              Abrir painel Mercado Pago <ExternalLink className="h-3 w-3" />
            </a>
          </Panel>

          <Panel className="p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-violet-50 text-violet-700">
                  <Plug className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900">Melhor Envio</h2>
                  <p className="text-xs text-zinc-500">Cotações de frete no checkout</p>
                </div>
              </div>
              <StatusBadge status="ok" />
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3 border-t border-zinc-100 pt-2">
                <dt className="text-zinc-500">App / Client ID</dt>
                <dd className="text-zinc-800">configurado</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-zinc-500">Token OAuth</dt>
                <dd className="text-zinc-800">MELHOR_ENVIO_TOKEN nas secrets</dd>
              </div>
            </dl>
            <a
              href="https://melhorenvio.com.br/painel"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-wine hover:underline"
            >
              Abrir Melhor Envio <ExternalLink className="h-3 w-3" />
            </a>
          </Panel>
        </div>
      </div>
    </div>
  );
}
