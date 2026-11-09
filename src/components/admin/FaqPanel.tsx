import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useFaq, type FaqItem } from "@/lib/cms-extras";
import { Field, PageHeader, Panel, field } from "./shared";

export function FaqPanel() {
  const [items, setItems] = useFaq();
  const [q, setQ] = useState("");
  const [a, setA] = useState("");

  const add = () => {
    if (!q.trim() || !a.trim()) {
      toast.error("Preencha pergunta e resposta");
      return;
    }
    const item: FaqItem = { id: `f-${Date.now()}`, question: q.trim(), answer: a.trim() };
    setItems([item, ...items]);
    setQ("");
    setA("");
    toast.success("Pergunta adicionada");
  };

  return (
    <div>
      <PageHeader title="FAQ" subtitle="Perguntas frequentes exibidas em /faq" />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Panel className="space-y-3 p-5">
          <Field label="Pergunta" value={q} onChange={setQ} />
          <Field label="Resposta" value={a} onChange={setA} multiline />
          <button type="button" onClick={add} className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md bg-wine text-xs font-medium text-ivory hover:bg-wine-deep">
            <Plus className="h-3.5 w-3.5" /> Adicionar
          </button>
        </Panel>
        <Panel className="divide-y divide-zinc-100 overflow-hidden">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 p-4">
              <div className="min-w-0 flex-1 space-y-2">
                <input
                  className={field}
                  value={item.question}
                  onChange={(e) => setItems(items.map((x) => (x.id === item.id ? { ...x, question: e.target.value } : x)))}
                />
                <textarea
                  className={`${field} min-h-[72px]`}
                  value={item.answer}
                  onChange={(e) => setItems(items.map((x) => (x.id === item.id ? { ...x, answer: e.target.value } : x)))}
                />
              </div>
              <button
                type="button"
                className="h-9 w-9 shrink-0 rounded-md border border-zinc-200 text-zinc-500 hover:bg-red-50 hover:text-red-600"
                onClick={() => {
                  setItems(items.filter((x) => x.id !== item.id));
                  toast.success("Removido");
                }}
              >
                <Trash2 className="mx-auto h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {items.length === 0 && <p className="p-8 text-center text-sm text-zinc-500">Nenhuma pergunta ainda</p>}
        </Panel>
      </div>
    </div>
  );
}
