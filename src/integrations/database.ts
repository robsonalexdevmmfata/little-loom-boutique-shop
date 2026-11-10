import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Health check do PostgreSQL — use no admin / diagnóstico. */
export const dbHealth = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { pingDatabase } = await import("@/server/db");
    const ok = await pingDatabase();
    return { ok, message: ok ? "PostgreSQL conectado" : "Sem resposta" };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Falha ao conectar no PostgreSQL",
    };
  }
});

/** Lista produtos publicados do banco. */
export const dbListProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { listPublishedProducts } = await import("@/server/catalog");
  const rows = await listPublishedProducts();
  return rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    subcategory: p.subcategory ?? undefined,
    price: Number(p.price),
    promo: p.promo != null ? Number(p.promo) : undefined,
    stock: p.stock,
    stockBySize: p.stock_by_size ?? {},
    image: p.image,
    gallery: p.gallery ?? [],
    description: p.description,
    details: p.details ?? [],
    composition: p.composition ?? undefined,
    care: p.care ?? undefined,
    color: p.color ?? undefined,
    sku: p.sku ?? undefined,
    sizes: p.sizes ?? [],
    showInVitrine: p.show_in_vitrine,
    featured: p.featured,
    isNew: p.is_new,
    best: p.best,
    status: p.status,
    seoTitle: p.seo_title ?? undefined,
    seoDescription: p.seo_description ?? undefined,
  }));
});

export const dbGetProductBySlug = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { getProductBySlug } = await import("@/server/catalog");
    const p = await getProductBySlug(data.slug);
    if (!p) return null;
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      price: Number(p.price),
      promo: p.promo != null ? Number(p.promo) : undefined,
      stock: p.stock,
      image: p.image,
      description: p.description,
      sizes: p.sizes ?? [],
      status: p.status,
    };
  });

/** Snapshot inicial do CMS no Postgres (FAQ, reviews, popup, categorias). */
export const dbStorefrontExtras = createServerFn({ method: "GET" }).handler(async () => {
  const { listApprovedReviews, listFaq, listCategories, getCampaignPopup, getCommerceConfig } =
    await import("@/server/catalog");
  const [reviews, faq, categories, popup, commerce] = await Promise.all([
    listApprovedReviews(12),
    listFaq(),
    listCategories(),
    getCampaignPopup(),
    getCommerceConfig(),
  ]);
  return { reviews, faq, categories, popup, commerce };
});
