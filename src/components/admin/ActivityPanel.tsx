import { useActivity } from "@/lib/cms-extras";
import { PageHeader, Panel } from "./shared";

export function ActivityPanel() {
  const [log] = useActivity();

  return (
    <div>
      <PageHeader title="Histórico" subtitle="Alterações recentes de preço, estoque e pedidos" />
      <Panel className="divide-y divide-zinc-100 overflow-hidden">
        {log.map((e) => (
          <div key={e.id} className="flex flex-wrap items-start justify-between gap-2 px-4 py-3 text-sm">
            <div>
              <p className="font-medium text-zinc-900">
                {e.action} <span className="font-normal text-zinc-500">· {e.detail}</span>
              </p>
              <p className="text-xs text-zinc-400">{e.who}</p>
            </div>
            <p className="text-xs tabular-nums text-zinc-500">{new Date(e.at).toLocaleString("pt-BR")}</p>
          </div>
        ))}
        {log.length === 0 && <p className="p-10 text-center text-sm text-zinc-500">Nenhuma alteração registrada ainda.</p>}
      </Panel>
    </div>
  );
}
