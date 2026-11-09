import { Copy, ImagePlus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { fileToCompressedDataUrl } from "@/lib/image-upload";
import { useMediaLibrary } from "@/lib/media-library";
import { EmptyState, PageHeader, Panel } from "./shared";

export function MediaPanel() {
  const { items, add, remove } = useMediaLibrary();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div>
      <PageHeader
        title="Mídia"
        subtitle="Biblioteca de fotos reutilizáveis na loja e no catálogo"
        actions={
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-wine px-3 text-xs font-medium text-ivory hover:bg-wine-deep disabled:opacity-50"
          >
            <ImagePlus className="h-3.5 w-3.5" /> {busy ? "Enviando…" : "Enviar fotos"}
          </button>
        }
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={async (e) => {
          const files = [...(e.target.files ?? [])];
          e.target.value = "";
          if (!files.length) return;
          setBusy(true);
          try {
            for (const file of files) {
              const url = await fileToCompressedDataUrl(file);
              add(url, file.name);
            }
            toast.success(`${files.length} foto(s) adicionada(s)`);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Falha no upload");
          } finally {
            setBusy(false);
          }
        }}
      />

      <Panel className="overflow-hidden">
        {items.length === 0 ? (
          <EmptyState title="Biblioteca vazia" text="Envie fotos aqui ou pelo upload de banner/produto — elas entram automaticamente." />
        ) : (
          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {items.map((m) => (
              <div key={m.id} className="group overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                <div className="aspect-[3/4] overflow-hidden">
                  <img src={m.url} alt={m.name} className="h-full w-full object-cover object-top" />
                </div>
                <div className="flex items-center justify-between gap-1 p-2">
                  <p className="truncate text-[11px] text-zinc-600">{m.name}</p>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      title="Copiar referência"
                      className="rounded p-1 text-zinc-500 hover:bg-white hover:text-zinc-800"
                      onClick={() => {
                        void navigator.clipboard.writeText(m.url.slice(0, 80) + "…");
                        toast.success("Referência da mídia pronta (use pelo upload nos editores)");
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" title="Excluir" className="rounded p-1 text-red-500 hover:bg-red-50" onClick={() => remove(m.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
      <p className="mt-3 text-center text-[11px] text-zinc-500">{items.length}/80 slots · uploads do admin entram aqui automaticamente</p>
    </div>
  );
}
