import { Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSettings } from "@/lib/store";
import { Field, PageHeader, Panel } from "./shared";

export function PoliciesPanel() {
  const [s, setS] = useSettings();
  const [saved, setSaved] = useState(false);

  const persist = (next: typeof s) => {
    setS(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 900);
    toast.success("Políticas salvas");
  };

  return (
    <div>
      <PageHeader
        title="Políticas"
        subtitle="Textos de privacidade, trocas e entrega exibidos no rodapé"
        actions={
          saved ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              <Check className="h-3.5 w-3.5" /> Salvo
            </span>
          ) : null
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {(
          [
            ["footerPolicy1", "policyBody1", "Política 1"],
            ["footerPolicy2", "policyBody2", "Política 2"],
            ["footerPolicy3", "policyBody3", "Política 3"],
          ] as const
        ).map(([titleKey, bodyKey, label]) => (
          <Panel key={titleKey} className="space-y-3 p-5">
            <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">{label}</p>
            <Field label="Título no rodapé" value={s[titleKey]} onChange={(v) => persist({ ...s, [titleKey]: v })} />
            <Field label="Texto completo" value={s[bodyKey] ?? ""} onChange={(v) => persist({ ...s, [bodyKey]: v })} multiline />
          </Panel>
        ))}
      </div>
      <p className="mt-4 text-center text-[11px] text-zinc-500">Os títulos aparecem no rodapé; os textos completos ficam prontos para páginas / FAQ futuros.</p>
    </div>
  );
}
