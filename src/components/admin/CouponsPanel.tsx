import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { brl, useCoupons, type Coupon } from "@/lib/store";
import { EmptyState, PageHeader, Panel, field } from "./shared";

export function CouponsPanel() {
  const [coupons, setCoupons] = useCoupons();
  const [draft, setDraft] = useState({
    code: "",
    type: "percent" as Coupon["type"],
    value: 10,
    minOrder: 0,
    note: "",
  });

  const add = () => {
    const code = draft.code.trim().toUpperCase();
    if (!code) {
      toast.error("Informe o código do cupom");
      return;
    }
    if (coupons.some((c) => c.code.toUpperCase() === code)) {
      toast.error("Já existe um cupom com esse código");
      return;
    }
    if (draft.value <= 0) {
      toast.error("Valor inválido");
      return;
    }
    setCoupons([
      ...coupons,
      {
        id: String(Date.now()),
        code,
        type: draft.type,
        value: draft.value,
        minOrder: draft.minOrder || 0,
        note: draft.note.trim() || undefined,
        active: true,
      },
    ]);
    setDraft({ code: "", type: "percent", value: 10, minOrder: 0, note: "" });
    toast.success("Cupom criado");
  };

  const upd = (id: string, patch: Partial<Coupon>) => setCoupons(coupons.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  return (
    <div>
      <PageHeader title="Cupons" subtitle="Descontos aplicados no checkout e na sacola" />

      <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
        <Panel className="h-fit space-y-3 p-5">
          <h2 className="text-sm font-semibold text-zinc-900">Novo cupom</h2>
          <label className="block text-xs font-medium text-zinc-600">
            Código
            <input
              className={`${field} mt-1.5 uppercase`}
              value={draft.code}
              onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
              placeholder="EX: REIS10"
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-medium text-zinc-600">
              Tipo
              <select className={`${field} mt-1.5`} value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as Coupon["type"] })}>
                <option value="percent">Percentual</option>
                <option value="fixed">Valor fixo</option>
              </select>
            </label>
            <label className="block text-xs font-medium text-zinc-600">
              Valor
              <input
                type="number"
                className={`${field} mt-1.5`}
                value={draft.value}
                onChange={(e) => setDraft({ ...draft, value: +e.target.value })}
              />
            </label>
          </div>
          <label className="block text-xs font-medium text-zinc-600">
            Pedido mínimo (R$)
            <input
              type="number"
              className={`${field} mt-1.5`}
              value={draft.minOrder}
              onChange={(e) => setDraft({ ...draft, minOrder: +e.target.value })}
            />
          </label>
          <label className="block text-xs font-medium text-zinc-600">
            Observação
            <input className={`${field} mt-1.5`} value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} placeholder="Opcional" />
          </label>
          <button type="button" onClick={add} className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md bg-wine text-xs font-medium text-ivory hover:bg-wine-deep">
            <Plus className="h-3.5 w-3.5" /> Criar cupom
          </button>
        </Panel>

        <Panel className="overflow-hidden">
          {coupons.length === 0 ? (
            <EmptyState title="Nenhum cupom" text="Crie cupons percentuais ou de valor fixo para campanhas e primeira compra." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-zinc-50 text-left text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
                  <tr>
                    <th className="px-4 py-3">Código</th>
                    <th className="px-3 py-3">Desconto</th>
                    <th className="px-3 py-3">Mínimo</th>
                    <th className="px-3 py-3">Ativo</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.id} className="border-t border-zinc-100">
                      <td className="px-4 py-3">
                        <p className="font-semibold tracking-wide text-zinc-900">{c.code}</p>
                        {c.note && <p className="text-xs text-zinc-500">{c.note}</p>}
                      </td>
                      <td className="px-3 py-3 tabular-nums text-zinc-700">
                        {c.type === "percent" ? `${c.value}%` : brl(c.value)}
                      </td>
                      <td className="px-3 py-3 tabular-nums text-zinc-600">{c.minOrder ? brl(c.minOrder) : "—"}</td>
                      <td className="px-3 py-3">
                        <Switch checked={c.active} onCheckedChange={(v) => upd(c.id, { active: v })} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          className="inline-flex h-8 items-center gap-1 rounded-md border border-red-200 px-2.5 text-xs font-medium text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setCoupons(coupons.filter((x) => x.id !== c.id));
                            toast.message("Cupom removido");
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
