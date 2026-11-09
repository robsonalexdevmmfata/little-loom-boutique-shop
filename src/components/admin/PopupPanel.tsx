import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { useCampaignPopup } from "@/lib/cms-extras";
import { Field, PageHeader, Panel } from "./shared";

export function PopupPanel() {
  const [cfg, setCfg] = useCampaignPopup();

  const persist = (next: typeof cfg) => {
    setCfg(next);
    toast.success("Popup salvo — aparece na home da loja");
  };

  return (
    <div>
      <PageHeader title="Popup" subtitle="Campanha na entrada da home (não aparece no admin/checkout)" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Ativo na loja</p>
              <p className="text-xs text-zinc-500">Abre após o delay na home</p>
            </div>
            <Switch checked={cfg.active} onCheckedChange={(v) => persist({ ...cfg, active: v })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Só na home</p>
              <p className="text-xs text-zinc-500">Recomendado — evita incomodar no checkout</p>
            </div>
            <Switch checked={cfg.homeOnly !== false} onCheckedChange={(v) => persist({ ...cfg, homeOnly: v })} />
          </div>
          <Field label="Título" value={cfg.title} onChange={(v) => persist({ ...cfg, title: v })} />
          <Field label="Texto" value={cfg.text} onChange={(v) => persist({ ...cfg, text: v })} multiline />
          <Field label="Cupom em destaque" value={cfg.couponCode ?? ""} onChange={(v) => persist({ ...cfg, couponCode: v })} hint="Ex.: BEMVINDA — cliente copia com 1 clique" />
          <Field label="Texto do botão" value={cfg.cta} onChange={(v) => persist({ ...cfg, cta: v })} />
          <Field label="Link do botão" value={cfg.ctaHref} onChange={(v) => persist({ ...cfg, ctaHref: v })} hint="/#novidades · /faq · /produto/slug" />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Delay (ms)"
              type="number"
              value={cfg.delayMs ?? 1600}
              onChange={(v) => persist({ ...cfg, delayMs: Math.max(400, Number(v) || 1600) })}
            />
            <Field
              label="Dias até reaparecer"
              type="number"
              value={cfg.dismissDays}
              onChange={(v) => persist({ ...cfg, dismissDays: Math.max(1, Number(v) || 5) })}
            />
          </div>
          <p className="text-[11px] text-zinc-500">Se você mudar o texto/cupom, o popup volta a aparecer mesmo para quem já fechou.</p>
        </Panel>

        <Panel className="overflow-hidden p-0">
          <div className="border-b border-zinc-100 bg-zinc-50 px-4 py-2 text-[11px] font-medium tracking-wide text-zinc-500 uppercase">Prévia</div>
          <div className="bg-wine-deep/40 p-6">
            <div className="mx-auto max-w-sm overflow-hidden border border-[#e4d8cf] bg-[#fbfaf8] shadow-lg">
              <div className="h-1.5 bg-gradient-to-r from-wine via-champagne to-wine" />
              <div className="px-6 py-6">
                <p className="text-[10px] tracking-[0.35em] text-wine/60 uppercase">Oferta da loja</p>
                <p className="mt-2 font-display text-2xl text-wine">{cfg.title || "Título"}</p>
                <p className="mt-2 text-sm text-zinc-600">{cfg.text || "Texto da campanha"}</p>
                {cfg.couponCode?.trim() && (
                  <p className="mt-4 inline-block border border-dashed border-wine/40 bg-blush/60 px-3 py-1.5 font-mono text-sm text-wine">{cfg.couponCode}</p>
                )}
                <p className="mt-5 inline-flex h-10 items-center bg-wine px-4 text-[10px] tracking-widest text-ivory uppercase">{cfg.cta || "CTA"}</p>
              </div>
            </div>
            <p className="mt-4 text-center text-[11px] text-ivory/70">{cfg.active ? "Status: ativo na home" : "Status: desligado"}</p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
