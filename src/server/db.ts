import postgres from "postgres";

/**
 * Cliente PostgreSQL (server-only).
 * DATABASE_URL=postgresql://reinoir:320809@localhost:5432/reinoir
 */
const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  "postgresql://reinoir:320809@localhost:5432/reinoir";

declare global {
  // eslint-disable-next-line no-var
  var __rnSql: ReturnType<typeof postgres> | undefined;
}

export const sql =
  globalThis.__rnSql ??
  postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__rnSql = sql;
}

export type DbProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory: string | null;
  price: string;
  promo: string | null;
  stock: number;
  stock_by_size: Record<string, number>;
  image: string;
  gallery: string[];
  description: string;
  details: string[];
  composition: string | null;
  care: string | null;
  color: string | null;
  sku: string | null;
  sizes: string[];
  show_in_vitrine: boolean;
  featured: boolean;
  is_new: boolean;
  best: boolean;
  status: "publicado" | "rascunho";
  seo_title: string | null;
  seo_description: string | null;
};

export async function pingDatabase() {
  const rows = await sql<{ ok: number }[]>`SELECT 1 AS ok`;
  return rows[0]?.ok === 1;
}
