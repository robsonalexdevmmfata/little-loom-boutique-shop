import { Plus, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { useReviews, type Review } from "@/lib/cms-extras";
import { useProducts } from "@/lib/store";
import { Field, PageHeader, Panel, field } from "./shared";

export function ReviewsPanel() {
  const [reviews, setReviews] = useReviews();
  const [products] = useProducts();
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState("5");
  const [text, setText] = useState("");

  const nameOf = (id: string) => products.find((p) => p.id === id)?.name ?? id;

  const add = () => {
    if (!productId || !author.trim() || !text.trim()) {
      toast.error("Preencha produto, nome e texto");
      return;
    }
    const item: Review = {
      id: `r-${Date.now()}`,
      productId,
      author: author.trim(),
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      text: text.trim(),
      date: new Date().toISOString().slice(0, 10),
      approved: true,
    };
    setReviews([item, ...reviews]);
    setAuthor("");
    setText("");
    toast.success("Avaliação publicada na loja");
  };

  return (
    <div>
      <PageHeader title="Avaliações" subtitle="Aparecem na home (Depoimentos) e na página do produto" />
      <div className="mb-4 grid gap-4 lg:grid-cols-[300px_1fr]">
        <Panel className="space-y-3 p-5">
          <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">Nova avaliação</p>
          <label className="block text-sm font-medium text-zinc-700">
            Produto
            <select className={`${field} mt-1.5`} value={productId} onChange={(e) => setProductId(e.target.value)}>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <Field label="Cliente" value={author} onChange={setAuthor} />
          <Field label="Nota (1–5)" type="number" value={rating} onChange={setRating} />
          <Field label="Texto" value={text} onChange={setText} multiline />
          <button type="button" onClick={add} className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md bg-wine text-xs font-medium text-ivory">
            <Plus className="h-3.5 w-3.5" /> Publicar na loja
          </button>
        </Panel>
        <Panel className="overflow-hidden">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-zinc-50 text-left text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
              <tr>
                <th className="px-4 py-3">Produto</th>
                <th className="px-3 py-3">Cliente</th>
                <th className="px-3 py-3">Nota</th>
                <th className="px-3 py-3">Texto</th>
                <th className="px-4 py-3">Na loja</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id} className="border-t border-zinc-100">
                  <td className="px-4 py-3 font-medium">{nameOf(r.productId)}</td>
                  <td className="px-3 py-3">{r.author}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {r.rating}
                    </span>
                  </td>
                  <td className="max-w-xs px-3 py-3 text-zinc-600">{r.text}</td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={r.approved}
                      onCheckedChange={(v) => {
                        setReviews(reviews.map((x) => (x.id === r.id ? { ...x, approved: v } : x)));
                        toast.success(v ? "Visível na loja" : "Ocultada");
                      }}
                    />
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-14 text-center text-sm text-zinc-500">
                    Nenhuma avaliação
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
}
