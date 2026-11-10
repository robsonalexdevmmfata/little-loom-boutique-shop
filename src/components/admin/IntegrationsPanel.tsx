import { CheckCircle2, Database, ExternalLink, Megaphone, Plug, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { dbHealth } from "@/integrations/db-api";
import { getMpPublicKey } from "@/integrations/mercado-pago";
import { useMetaAds } from "@/lib/meta-ads";
import { PageHeader, Panel } from "./shared";

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

export function IntegrationsPanel({ onOpenMeta }: { onOpenMeta?: () => void }) {
  const [mp, setMp] = useState<Status>("loading");
  const [mpKey, setMpKey] = useState("");
  const [mpConfigured, setMpConfigured] = useState(false);
  const [db, setDb] = useState<Status>("loading");
  const [dbMsg, setDbMsg] = useState("");
  const [meta] = useMetaAds();
  const pixelReady = meta.enabled && Boolean(meta.pixelId.trim());

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
    dbHealth()
      .then((r) => {
        if (!alive) return;
        setDb(r.ok ? "ok" : "off");
        setDbMsg(r.message);
      })
      .catch((e) => {
        if (!alive) return;
        setDb("off");
        setDbMsg(e instanceof Error ? e.message : "Erro ao testar banco");
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div>
      <PageHeader title="Integrações" subtitle="Pagamentos, frete e canais conectados" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="overflow-hidden border-blue-200/70 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-[#1877F2]/10 to-transparent px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#1877F2] text-white">
                <Megaphone className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-zinc-900">Meta Ads · Facebook & Instagram</p>
                <p className="text-xs text-zinc-500">Pixel, catálogo e feed de anúncios — configuração completa no menu Marketing</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={pixelReady ? "ok" : "off"} />
              <button
                type="button"
                onClick={onOpenMeta}
                className="inline-flex h-9 items-center rounded-md bg-[#1877F2] px-3 text-xs font-medium text-white hover:bg-[#166fe5]"
              >
                Abrir Meta Ads
              </button>
            </div>
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                <Database className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">PostgreSQL</h2>
                <p className="text-xs text-zinc-500">Banco reinoir</p>
              </div>
            </div>
            <StatusBadge status={db} />
          </div>
          <p className="text-xs text-zinc-600">{dbMsg || "Checando…"}</p>
          <p className="mt-2 font-mono text-[11px] text-zinc-400">DATABASE_URL · pasta database/</p>
        </Panel>

        <Panel className="p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-sky-50 text-sky-700">
                <Plug className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">Mercado Pago</h2>
                <p className="text-xs text-zinc-500">Checkout transparente</p>
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
          <a href="https://www.mercadopago.com.br/developers/panel" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-wine hover:underline">
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
                <p className="text-xs text-zinc-500">Cotações de frete</p>
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
          <a href="https://melhorenvio.com.br/painel" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-wine hover:underline">
            Abrir Melhor Envio <ExternalLink className="h-3 w-3" />
          </a>
        </Panel>
      </div>
    </div>
  );
}
