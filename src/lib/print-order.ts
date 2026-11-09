import type { Order } from "@/lib/store";
import { brl } from "@/lib/store";

export function printOrderSlip(order: Order, storeName = "REIS NOIR") {
  const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Pedido ${order.id}</title>
  <style>
    body { font-family: system-ui, sans-serif; color: #18181b; padding: 32px; max-width: 720px; margin: 0 auto; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    .muted { color: #71717a; font-size: 12px; }
    .row { display: flex; justify-content: space-between; gap: 16px; margin-top: 24px; }
    .box { border: 1px solid #e4e4e7; border-radius: 8px; padding: 14px; flex: 1; }
    .box h2 { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: #71717a; margin: 0 0 8px; }
    table { width: 100%; border-collapse: collapse; margin-top: 24px; font-size: 13px; }
    th, td { text-align: left; padding: 8px 0; border-bottom: 1px solid #f4f4f5; }
    th { color: #71717a; font-size: 11px; text-transform: uppercase; }
    .total { font-size: 18px; font-weight: 700; margin-top: 16px; text-align: right; }
    .note { margin-top: 20px; padding: 12px; background: #fafafa; border-radius: 8px; font-size: 12px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>${storeName}</h1>
  <p class="muted">Comprovante / etiqueta de separação</p>
  <div class="row">
    <div class="box">
      <h2>Pedido</h2>
      <div><strong>${order.id}</strong></div>
      <div class="muted">${order.date} · ${order.status}</div>
      <div class="muted">${order.payment ?? "Pagamento —"}</div>
    </div>
    <div class="box">
      <h2>Cliente</h2>
      <div><strong>${order.customer}</strong></div>
      <div class="muted">${order.email}</div>
      <div class="muted">${order.phone ?? ""}</div>
      <div class="muted">${order.city ?? ""}</div>
    </div>
  </div>
  <table>
    <thead><tr><th>Resumo</th><th></th></tr></thead>
    <tbody>
      <tr><td>Itens</td><td>${order.items}</td></tr>
      <tr><td>Total</td><td>${brl(order.total)}</td></tr>
    </tbody>
  </table>
  <div class="total">${brl(order.total)}</div>
  ${order.note ? `<div class="note"><strong>Nota interna:</strong> ${order.note}</div>` : ""}
  <script>window.onload = () => { window.print(); };</script>
</body>
</html>`;

  const w = window.open("", "_blank", "noopener,noreferrer,width=800,height=900");
  if (!w) return;
  w.document.write(html);
  w.document.close();
}
