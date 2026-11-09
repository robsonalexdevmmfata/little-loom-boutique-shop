import { Check, Download, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  ADMIN_PASSWORD,
  seedCatalog,
  seedCommerce,
  seedCoupons,
  seedSettings,
  useCatalog,
  useCommerce,
  useCoupons,
  useOrders,
  useProducts,
  useSettings,
} from "@/lib/store";
import { Field, PageHeader, Panel } from "./shared";

export function SettingsPanel() {
  const [commerce, setCommerce] = useCommerce();
  const [products] = useProducts();
  const [orders] = useOrders();
  const [coupons] = useCoupons();
  const [settings] = useSettings();
  const [catalog] = useCatalog();
  const [saved, setSaved] = useState(false);

  const persist = (next: typeof commerce) => {
    setCommerce(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1000);
    toast.success("Configurações salvas");
  };

  const exportBackup = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      products,
      orders,
      coupons,
      settings,
      catalog,
      commerce,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-reis-noir-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup baixado");
  };

  const importBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as Record<string, unknown>;
        if (data.products) localStorage.setItem("rn-products-v5", JSON.stringify(data.products));
        if (data.orders) localStorage.setItem("rn-orders-v3", JSON.stringify(data.orders));
        if (data.coupons) localStorage.setItem("rn-coupons-v1", JSON.stringify(data.coupons));
        if (data.settings) localStorage.setItem("rn-settings-v2", JSON.stringify(data.settings));
        if (data.catalog) localStorage.setItem("rn-catalog-v1", JSON.stringify(data.catalog));
        if (data.commerce) localStorage.setItem("rn-commerce-v1", JSON.stringify(data.commerce));
        window.dispatchEvent(new Event("rn-store"));
        toast.success("Backup importado — recarregue se algo não atualizar");
        window.location.reload();
      } catch {
        toast.error("Arquivo inválido");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <PageHeader
        title="Configurações"
        subtitle="Operação da loja, frete e backup"
        actions={
          saved ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              <Check className="h-3.5 w-3.5" /> Salvo
            </span>
          ) : null
        }
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel className="space-y-4 p-5">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">Identidade da loja</h2>
            <p className="text-xs text-zinc-500">Nome exibido no painel e rótulo da URL</p>
          </div>
          <Field label="Nome da loja" value={commerce.storeName} onChange={(v) => persist({ ...commerce, storeName: v })} />
          <Field label="Identificador" value={commerce.storeUrlLabel} onChange={(v) => persist({ ...commerce, storeUrlLabel: v })} hint="ex: reisnoir" />
          <Field label="E-mail de suporte" value={commerce.supportEmail} onChange={(v) => persist({ ...commerce, supportEmail: v })} />
        </Panel>

        <Panel className="space-y-4 p-5">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">Frete e estoque</h2>
            <p className="text-xs text-zinc-500">Regras usadas na sacola e nos alertas do painel</p>
          </div>
          <Field
            label="Frete grátis a partir de (R$)"
            type="number"
            value={commerce.freeShippingFrom}
            onChange={(v) => persist({ ...commerce, freeShippingFrom: Number(v) || 0 })}
          />
          <Field
            label="Frete padrão (R$)"
            type="number"
            value={commerce.flatShipping}
            onChange={(v) => persist({ ...commerce, flatShipping: Number(v) || 0 })}
          />
          <Field
            label="Alerta de estoque baixo"
            type="number"
            value={commerce.lowStockThreshold}
            onChange={(v) => persist({ ...commerce, lowStockThreshold: Number(v) || 0 })}
            hint="unidades"
          />
        </Panel>

        <Panel className="space-y-4 p-5">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">Modo manutenção</h2>
            <p className="text-xs text-zinc-500">Exibe aviso no topo da loja para clientes</p>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-zinc-900">Loja em manutenção</p>
              <p className="text-xs text-zinc-500">Não bloqueia o site — apenas avisa</p>
            </div>
            <Switch
              checked={!!commerce.maintenanceMode}
              onCheckedChange={(v) => persist({ ...commerce, maintenanceMode: v })}
            />
          </div>
          <Field
            label="Mensagem de manutenção"
            value={commerce.maintenanceMessage ?? ""}
            onChange={(v) => persist({ ...commerce, maintenanceMessage: v })}
          />
        </Panel>

        <Panel className="space-y-4 p-5">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">Acesso ao painel</h2>
            <p className="text-xs text-zinc-500">Senha atual do ambiente demo</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
            Senha administrativa: <strong className="font-mono tracking-wider">{ADMIN_PASSWORD}</strong>
          </div>
          <p className="text-xs text-zinc-500">Em produção, troque essa senha no código ou conecte autenticação real (Supabase/Auth).</p>
        </Panel>

        <Panel className="space-y-4 p-5">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">Backup e restauração</h2>
            <p className="text-xs text-zinc-500">Exporte ou importe catálogo, pedidos, cupons e aparência</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportBackup}
              className="inline-flex h-10 items-center gap-1.5 rounded-md bg-zinc-900 px-4 text-xs font-medium text-white hover:bg-zinc-800"
            >
              <Download className="h-3.5 w-3.5" /> Baixar backup JSON
            </button>
            <label className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-4 text-xs font-medium text-zinc-700 hover:bg-zinc-50">
              <Upload className="h-3.5 w-3.5" /> Importar backup
              <input
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) importBackup(file);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          <button
            type="button"
            className="text-xs font-medium text-red-600 hover:underline"
            onClick={() => {
              if (!confirm("Resetar cupons e configurações comerciais para o padrão?")) return;
              localStorage.setItem("rn-coupons-v1", JSON.stringify(seedCoupons));
              localStorage.setItem("rn-commerce-v1", JSON.stringify(seedCommerce));
              localStorage.setItem("rn-catalog-v1", JSON.stringify(seedCatalog));
              localStorage.setItem("rn-settings-v2", JSON.stringify(seedSettings));
              window.dispatchEvent(new Event("rn-store"));
              toast.message("Padrões restaurados");
              window.location.reload();
            }}
          >
            Restaurar padrões de cupons/config
          </button>
        </Panel>
      </div>
    </div>
  );
}
