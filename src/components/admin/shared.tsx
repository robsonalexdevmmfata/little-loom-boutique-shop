import { ImagePlus, Trash2 } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { fileToCompressedDataUrl } from "@/lib/image-upload";
import { pushToMediaLibrary } from "@/lib/media-library";
import type { Order, Product } from "@/lib/store";

export const field =
  "h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-wine focus:ring-2 focus:ring-wine/15";
export const area =
  "min-h-[96px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-wine focus:ring-2 focus:ring-wine/15";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 md:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-zinc-200 bg-white shadow-sm ${className}`}>{children}</div>;
}

export function StatusPill({ status }: { status: Order["status"] }) {
  const styles: Record<Order["status"], string> = {
    "Aguardando pagamento": "bg-amber-50 text-amber-800 ring-amber-200",
    Pago: "bg-wine/10 text-wine ring-wine/20",
    Enviado: "bg-sky-50 text-sky-800 ring-sky-200",
    Entregue: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  };
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${styles[status]}`}>{status}</span>;
}

export function ProductStatusBadge({ status }: { status: Product["status"] }) {
  return status === "publicado" ? (
    <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
      Publicado
    </span>
  ) : (
    <span className="inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 ring-1 ring-inset ring-zinc-200">
      Rascunho
    </span>
  );
}

export function Field({
  label,
  hint,
  value,
  onChange,
  multiline,
  type = "text",
}: {
  label: string;
  hint?: string;
  value: string | number;
  onChange: (v: string) => void;
  multiline?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-zinc-600">{label}</span>
        {hint && <span className="text-[10px] text-zinc-400">{hint}</span>}
      </span>
      {multiline ? (
        <textarea className={area} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type={type} className={field} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <p className="text-sm font-semibold text-zinc-900">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-zinc-500">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ImageUploadField({
  label,
  hint,
  value,
  onChange,
  aspect = "video",
}: {
  label: string;
  hint?: string;
  value?: string;
  onChange: (v: string | undefined) => void;
  aspect?: "video" | "portrait" | "wide";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const ratio = aspect === "portrait" ? "aspect-[3/4]" : aspect === "wide" ? "aspect-[21/9]" : "aspect-video";

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-zinc-600">{label}</span>
        {hint && <span className="text-[10px] text-zinc-400">{hint}</span>}
      </div>
      <div className={`relative overflow-hidden rounded-lg border border-dashed border-zinc-300 bg-zinc-50 ${ratio}`}>
        {value ? (
          <>
            <div className="absolute inset-0 left-[28%]">
              <img src={value} alt="" className="h-full w-full object-cover object-[78%_20%]" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 from-[0%] via-zinc-900/90 via-[35%] to-transparent to-[70%]" />
            <p className="absolute bottom-2 left-3 z-10 text-[10px] tracking-wide text-white/80 uppercase">Texto esq. · foto dir.</p>
          </>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-500 transition hover:bg-zinc-100"
          >
            <ImagePlus className="h-6 w-6" />
            <span className="text-xs font-medium">{busy ? "Processando…" : "Enviar foto"}</span>
          </button>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
        >
          <ImagePlus className="h-3.5 w-3.5" /> {value ? "Trocar foto" : "Upload"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-red-200 px-3 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remover
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setBusy(true);
          try {
            const url = await fileToCompressedDataUrl(file);
            pushToMediaLibrary(url, file.name || "upload");
            onChange(url);
            toast.success("Foto atualizada");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Falha no upload");
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}

export function Drawer({
  open,
  title,
  subtitle,
  onClose,
  children,
  footer,
  wide,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" aria-label="Fechar" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative flex h-full w-full flex-col bg-white shadow-2xl ${wide ? "max-w-2xl" : "max-w-xl"}`}>
        <div className="flex items-start justify-between gap-3 border-b border-zinc-200 px-5 py-4">
          <div className="min-w-0">
            {subtitle && <p className="text-xs font-medium text-zinc-500">{subtitle}</p>}
            <h2 className="truncate text-base font-semibold text-zinc-900">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-md px-2 py-1 text-sm text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
            Fechar
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && <div className="border-t border-zinc-200 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}
