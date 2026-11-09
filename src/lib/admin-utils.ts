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
    ["Pedido", "Cliente", "E-mail", "Telefone", "Data", "Pagamento", "Itens", "Total", "Status", "Cidade", "Rastreio", "URL rastreio"],
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
      o.trackingCode ?? "",
      o.trackingUrl ?? "",
    ]),
  ]);
}

export function exportProductsCsv(products: Product[]) {
  downloadCsv("produtos-reis-noir.csv", [
    ["ID", "SKU", "Nome", "Slug", "Categoria", "Subcategoria", "Preço", "Promo", "Estoque", "Tamanhos", "EstoquePorTamanho", "Status", "Vitrine", "Destaque", "Novo", "Mais vendido", "Descrição", "Cor"],
    ...products.map((p) => [
      p.id,
      p.sku ?? "",
      p.name,
      p.slug,
      p.category,
      p.subcategory ?? "",
      String(p.price),
      p.promo != null ? String(p.promo) : "",
      String(p.stock),
      p.sizes.join("|"),
      p.stockBySize
        ? Object.entries(p.stockBySize)
            .map(([k, v]) => `${k}:${v}`)
            .join("|")
        : "",
      p.status,
      p.showInVitrine !== false ? "sim" : "não",
      p.featured ? "sim" : "não",
      p.isNew ? "sim" : "não",
      p.best ? "sim" : "não",
      p.description ?? "",
      p.color ?? "",
    ]),
  ]);
}

function yn(v: string) {
  const t = v.trim().toLowerCase();
  return t === "sim" || t === "1" || t === "true" || t === "yes";
}

function parseStockBySize(raw: string): Record<string, number> | undefined {
  const t = raw.trim();
  if (!t) return undefined;
  const out: Record<string, number> = {};
  for (const part of t.split("|")) {
    const [k, v] = part.split(":");
    if (k && v != null) out[k.trim()] = Math.max(0, Number(v) || 0);
  }
  return Object.keys(out).length ? out : undefined;
}

/** Importa CSV exportado (separador `;`). Atualiza por ID ou cria novos. */
export function parseProductsCsv(text: string, existing: Product[]): { products: Product[]; created: number; updated: number } {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { products: existing, created: 0, updated: 0 };
  const split = (line: string) => {
    const cols: string[] = [];
    let cur = "";
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (q && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else q = !q;
      } else if (ch === ";" && !q) {
        cols.push(cur);
        cur = "";
      } else cur += ch;
    }
    cols.push(cur);
    return cols.map((c) => c.replace(/^"|"$/g, "").trim());
  };
  const header = split(lines[0]).map((h) => h.toLowerCase());
  const idx = (name: string) => header.findIndex((h) => h === name.toLowerCase());
  const map = new Map(existing.map((p) => [p.id, { ...p }]));
  let created = 0;
  let updated = 0;
  for (const line of lines.slice(1)) {
    const cols = split(line);
    if (!cols.some(Boolean)) continue;
    const get = (name: string, fallback = "") => {
      const i = idx(name);
      return i >= 0 ? cols[i] ?? fallback : fallback;
    };
    const id = get("ID") || `csv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const prev = map.get(id);
    const sizesRaw = get("Tamanhos");
    const sizes = sizesRaw ? sizesRaw.split("|").map((s) => s.trim()).filter(Boolean) : prev?.sizes ?? ["P", "M", "G"];
    const stockBySize = parseStockBySize(get("EstoquePorTamanho"));
    const stock = Number(get("Estoque")) || (stockBySize ? Object.values(stockBySize).reduce((a, n) => a + n, 0) : prev?.stock ?? 0);
    const name = get("Nome") || prev?.name || "Produto";
    const slug =
      get("Slug") ||
      prev?.slug ||
      name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    const status = (get("Status") === "rascunho" ? "rascunho" : "publicado") as Product["status"];
    const next: Product = {
      id,
      sku: get("SKU") || prev?.sku,
      name,
      slug,
      category: get("Categoria") || prev?.category || "Vestidos",
      subcategory: get("Subcategoria") || prev?.subcategory,
      price: Number(get("Preço")) || prev?.price || 0,
      promo: get("Promo") ? Number(get("Promo")) : prev?.promo,
      stock,
      stockBySize: stockBySize ?? prev?.stockBySize,
      sizes,
      status,
      showInVitrine: get("Vitrine") ? yn(get("Vitrine")) : prev?.showInVitrine !== false,
      featured: get("Destaque") ? yn(get("Destaque")) : !!prev?.featured,
      isNew: get("Novo") ? yn(get("Novo")) : !!prev?.isNew,
      best: get("Mais vendido") ? yn(get("Mais vendido")) : !!prev?.best,
      description: get("Descrição") || prev?.description || "",
      color: get("Cor") || prev?.color,
      image: prev?.image || "",
      gallery: prev?.gallery,
      details: prev?.details,
      composition: prev?.composition,
      care: prev?.care,
      seoTitle: prev?.seoTitle,
      seoDescription: prev?.seoDescription,
    };
    if (prev) updated += 1;
    else created += 1;
    map.set(id, next);
  }
  return { products: [...map.values()], created, updated };
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
