import { Download } from "lucide-react";
import { toast } from "sonner";
import { downloadCsv } from "@/lib/admin-utils";
import { useNewsletter } from "@/lib/cms-extras";
import { PageHeader, Panel } from "./shared";

export function NewsletterPanel() {
  const [list] = useNewsletter();

  return (
    <div>
      <PageHeader
        title="Newsletter"
        subtitle="E-mails capturados no rodapé da loja"
        actions={
          <button
            type="button"
            onClick={() => {
              downloadCsv("newsletter-reis-noir.csv", [["E-mail", "Data"], ...list.map((x) => [x.email, x.date])]);
              toast.success("CSV baixado");
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <Download className="h-3.5 w-3.5" /> Exportar CSV
          </button>
        }
      />
      <Panel className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-[11px] font-medium tracking-wide text-zinc-500 uppercase">
            <tr>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Data</th>
            </tr>
          </thead>
          <tbody>
            {list.map((x) => (
              <tr key={x.email} className="border-t border-zinc-100">
                <td className="px-4 py-3">{x.email}</td>
                <td className="px-4 py-3 text-zinc-600">{x.date}</td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-14 text-center text-sm text-zinc-500">
                  Ainda sem inscritos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
