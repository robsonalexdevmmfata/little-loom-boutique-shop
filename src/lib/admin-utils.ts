import type { Order, Product } from "@/lib/store";
import { brl } from "@/lib/store";

export function downloadCsv(filename: string, rows: string[][]) {
  const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const body = rows.map((r) => r.map(esc).join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + body], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportOrdersCsv(orders: Order[]) {
  downloadCsv("pedidos-reis-noir.csv", [
    ["Pedido", "Cliente", "E-mail", "Telefone", "Data", "Pagamento", "Itens", "Total", "Status", "Cidade"],
    ...orders.map((o) => [
      o.id,
      o.customer,
      o.email,
      o.phone ?? "",
      o.date,
      o.payment ?? "",
      String(o.items),
      brl(o.total),
      o.status,
      o.city ?? "",
    ]),
  ]);
}

export function exportProductsCsv(products: Product[]) {
  downloadCsv("produtos-reis-noir.csv", [
    ["ID", "SKU", "Nome", "Categoria", "Subcategoria", "Preço", "Promo", "Estoque", "Status", "Vitrine", "Destaque", "Novo", "Mais vendido"],
    ...products.map((p) => [
      p.id,
      p.sku ?? "",
      p.name,
      p.category,
      p.subcategory ?? "",
      String(p.price),
      p.promo != null ? String(p.promo) : "",
      String(p.stock),
      p.status,
      p.showInVitrine !== false ? "sim" : "não",
      p.featured ? "sim" : "não",
      p.isNew ? "sim" : "não",
      p.best ? "sim" : "não",
    ]),
  ]);
}

export type CustomerRow = {
  email: string;
  name: string;
  phone?: string;
  orders: number;
  total: number;
  lastOrder: string;
  city?: string;
};

export function buildCustomers(orders: Order[]): CustomerRow[] {
  const map = new Map<string, CustomerRow>();
  for (const o of orders) {
    const key = o.email.toLowerCase();
    const prev = map.get(key);
    if (!prev) {
      map.set(key, {
        email: o.email,
        name: o.customer,
        phone: o.phone,
        orders: 1,
        total: o.total,
        lastOrder: o.date,
        city: o.city,
      });
    } else {
      prev.orders += 1;
      prev.total += o.total;
      if (o.date > prev.lastOrder) prev.lastOrder = o.date;
      if (o.phone) prev.phone = o.phone;
      if (o.city) prev.city = o.city;
      prev.name = o.customer;
    }
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}
