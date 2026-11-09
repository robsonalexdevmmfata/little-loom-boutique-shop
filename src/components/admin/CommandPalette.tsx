import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { AdminGo } from "./DashboardPanel";

const destinations: { id: AdminGo; label: string; hint: string }[] = [
  { id: "Painel", label: "Ir para Painel", hint: "Visão geral" },
  { id: "Pedidos", label: "Ir para Pedidos", hint: "Vendas e status" },
  { id: "Clientes", label: "Ir para Clientes", hint: "Base de compradores" },
  { id: "Produtos", label: "Ir para Produtos", hint: "Catálogo" },
  { id: "Estoque", label: "Ir para Estoque", hint: "Unidades" },
  { id: "Mídia", label: "Ir para Mídia", hint: "Fotos" },
  { id: "Cupons", label: "Ir para Cupons", hint: "Descontos" },
  { id: "Relatórios", label: "Ir para Relatórios", hint: "Métricas" },
  { id: "Aparência", label: "Ir para Aparência", hint: "Conteúdo" },
  { id: "Políticas", label: "Ir para Políticas", hint: "Privacidade e trocas" },
  { id: "Meta Ads", label: "Ir para Meta Ads", hint: "Facebook e Instagram" },
  { id: "Integrações", label: "Ir para Integrações", hint: "Pagamentos e frete" },
  { id: "Configurações", label: "Ir para Configurações", hint: "Operação" },
];

export function CommandPalette({
  open,
  onClose,
  onGo,
}: {
  open: boolean;
  onClose: () => void;
  onGo: (t: AdminGo) => void;
}) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return destinations;
    return destinations.filter((d) => `${d.label} ${d.hint} ${d.id}`.toLowerCase().includes(n));
  }, [q]);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setActive(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(list.length - 1, i + 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
      }
      if (e.key === "Enter" && list[active]) {
        e.preventDefault();
        onGo(list[active].id);
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, list, active, onClose, onGo]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 px-4 pt-[12vh]">
      <button type="button" aria-label="Fechar busca" className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl">
        <div className="flex items-center gap-2 border-b border-zinc-100 px-3">
          <Search className="h-4 w-4 text-zinc-400" />
          <input
            autoFocus
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            placeholder="Buscar páginas do CMS…"
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
          />
          <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] text-zinc-500">ESC</kbd>
        </div>
        <ul className="max-h-72 overflow-auto p-2">
          {list.length === 0 && <li className="px-3 py-6 text-center text-sm text-zinc-500">Nada encontrado</li>}
          {list.map((item, i) => (
            <li key={item.id}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => {
                  onGo(item.id);
                  onClose();
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm ${
                  i === active ? "bg-wine text-ivory" : "text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                <span className="font-medium">{item.label}</span>
                <span className={`text-xs ${i === active ? "text-ivory/70" : "text-zinc-400"}`}>{item.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
