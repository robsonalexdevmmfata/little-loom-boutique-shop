import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { useCampaignPopup } from "@/lib/cms-extras";
import { Field, PageHeader, Panel } from "./shared";

export function PopupPanel() {
  const [cfg, setCfg] = useCampaignPopup();

  const persist = (next: typeof cfg) => {
    setCfg(next);
    toast.success("Popup salvo");
  };

  return (
    <div>
      <PageHeader title="Popup" subtitle="Campanha na entrada da loja" />
      <Panel className="max-w-xl space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Ativo</p>
            <p className="text-xs text-zinc-500">Aparece após ~1s na loja</p>
          </div>
          <Switch checked={cfg.active} onCheckedChange={(v) => persist({ ...cfg, active: v })} />
        </div>
        <Field label="Título" value={cfg.title} onChange={(v) => persist({ ...cfg, title: v })} />
        <Field label="Texto" value={cfg.text} onChange={(v) => persist({ ...cfg, text: v })} multiline />
        <Field label="Botão" value={cfg.cta} onChange={(v) => persist({ ...cfg, cta: v })} />
        <Field label="Link do botão" value={cfg.ctaHref} onChange={(v) => persist({ ...cfg, ctaHref: v })} hint="/#novidades ou /faq" />
        <Field
          label="Dias até reaparecer"
          type="number"
          value={cfg.dismissDays}
          onChange={(v) => persist({ ...cfg, dismissDays: Math.max(1, Number(v) || 7) })}
        />
      </Panel>
    </div>
  );
}
