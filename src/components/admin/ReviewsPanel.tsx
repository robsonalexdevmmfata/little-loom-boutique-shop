import { Star } from "lucide-react";
import { toast } from "sonner";
import { useReviews } from "@/lib/cms-extras";
import { useProducts } from "@/lib/store";
import { Switch } from "@/components/ui/switch";
import { PageHeader, Panel } from "./shared";

export function ReviewsPanel() {
  const [reviews, setReviews] = useReviews();
  const [products] = useProducts();

  const nameOf = (id: string) => products.find((p) => p.id === id)?.name ?? id;

  return (
    <div>
      <PageHeader title="Avaliações" subtitle="Modere reviews exibidos nas páginas de produto" />
      <Panel className="overflow-hidden">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-zinc-50 text-left text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-3 py-3">Cliente</th>
              <th className="px-3 py-3">Nota</th>
              <th className="px-3 py-3">Texto</th>
              <th className="px-4 py-3">Publicado</th>
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
                      toast.success(v ? "Publicada" : "Ocultada");
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
  );
}
