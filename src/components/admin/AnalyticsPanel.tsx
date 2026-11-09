import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { useAnalytics } from "@/lib/cms-extras";
import { Field, PageHeader, Panel } from "./shared";

export function AnalyticsPanel() {
  const [cfg, setCfg] = useAnalytics();

  const persist = (next: typeof cfg) => {
    setCfg(next);
    toast.success("Analytics salvo");
  };

  return (
    <div>
      <PageHeader title="Google Analytics" subtitle="GA4 e Tag Manager ao lado do Meta Pixel" />
      <Panel className="max-w-xl space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Ativar tags Google</p>
            <p className="text-xs text-zinc-500">Injeta scripts na loja quando houver IDs</p>
          </div>
          <Switch checked={cfg.enabled} onCheckedChange={(v) => persist({ ...cfg, enabled: v })} />
        </div>
        <Field label="Measurement ID (GA4)" value={cfg.gaId} onChange={(v) => persist({ ...cfg, gaId: v })} hint="Ex.: G-XXXXXXXX" />
        <Field label="Container ID (GTM)" value={cfg.gtmId} onChange={(v) => persist({ ...cfg, gtmId: v })} hint="Ex.: GTM-XXXXXXX" />
      </Panel>
    </div>
  );
}
