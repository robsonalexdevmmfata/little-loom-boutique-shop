import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

async function repos() {
  return import("@/server/repos");
}

export const dbHealth = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { pingDatabase } = await import("@/server/db");
    const ok = await pingDatabase();
    return { ok, message: ok ? "PostgreSQL conectado" : "Sem resposta" };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Falha no PostgreSQL" };
  }
});

export const dbBootstrap = createServerFn({ method: "POST" }).handler(async () => {
  const r = await repos();
  const n = await r.productsCount();
  return { products: n, needsSeed: n === 0 };
});

export const dbGetProducts = createServerFn({ method: "GET" }).handler(async () => {
  const r = await repos();
  return r.fetchAllProducts();
});

export const dbSaveProducts = createServerFn({ method: "POST" })
  .validator(z.array(z.any()))
  .handler(async ({ data }) => {
    const r = await repos();
    // garante categorias referenciadas
    const cats = [...new Set(data.map((p: { category: string }) => p.category).filter(Boolean))];
    if (cats.length) {
      const existing = await r.fetchCategories();
      const names = new Set(existing.map((c) => c.name));
      const missing = cats.filter((c) => !names.has(c)).map((name) => ({ name, image: "", subcategories: [] as string[] }));
      if (missing.length) await r.upsertCategories([...existing, ...missing]);
    }
    await r.upsertProducts(data);
    return { ok: true };
  });

export const dbGetCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const r = await repos();
  return r.fetchCategories();
});

export const dbSaveCatalog = createServerFn({ method: "POST" })
  .validator(z.array(z.any()))
  .handler(async ({ data }) => {
    const r = await repos();
    await r.upsertCategories(data);
    return { ok: true };
  });

export const dbGetOrders = createServerFn({ method: "GET" }).handler(async () => {
  const r = await repos();
  return r.fetchOrders();
});

export const dbSaveOrders = createServerFn({ method: "POST" })
  .validator(z.array(z.any()))
  .handler(async ({ data }) => {
    const r = await repos();
    await r.upsertOrders(data);
    return { ok: true };
  });

export const dbCreateOrder = createServerFn({ method: "POST" })
  .validator(
    z.object({
      order: z.any(),
      lines: z
        .array(
          z.object({
            productId: z.string(),
            name: z.string(),
            size: z.string(),
            qty: z.number(),
            unitPrice: z.number(),
          }),
        )
        .optional(),
      decrementStock: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const r = await repos();
    await r.insertOrder(data.order, data.lines);
    if (data.decrementStock && data.lines?.length) {
      await r.decrementStock(data.lines.map((l) => ({ productId: l.productId, size: l.size, qty: l.qty })));
    }
    return { ok: true };
  });

export const dbGetCoupons = createServerFn({ method: "GET" }).handler(async () => {
  const r = await repos();
  return r.fetchCoupons();
});

export const dbSaveCoupons = createServerFn({ method: "POST" })
  .validator(z.array(z.any()))
  .handler(async ({ data }) => {
    const r = await repos();
    await r.upsertCoupons(data);
    return { ok: true };
  });

export const dbGetCommerce = createServerFn({ method: "GET" }).handler(async () => {
  const r = await repos();
  return r.fetchCommerce();
});

export const dbSaveCommerce = createServerFn({ method: "POST" })
  .validator(z.any())
  .handler(async ({ data }) => {
    const r = await repos();
    await r.saveCommerce(data);
    return { ok: true };
  });

export const dbGetSettings = createServerFn({ method: "GET" }).handler(async () => {
  const r = await repos();
  return r.fetchSettingsJson();
});

export const dbSaveSettings = createServerFn({ method: "POST" })
  .validator(z.any())
  .handler(async ({ data }) => {
    const r = await repos();
    await r.saveSettingsJson(data);
    return { ok: true };
  });

export const dbGetFaq = createServerFn({ method: "GET" }).handler(async () => {
  const r = await repos();
  return r.fetchFaq();
});

export const dbSaveFaq = createServerFn({ method: "POST" })
  .validator(z.array(z.any()))
  .handler(async ({ data }) => {
    const r = await repos();
    await r.upsertFaq(data);
    return { ok: true };
  });

export const dbGetReviews = createServerFn({ method: "GET" }).handler(async () => {
  const r = await repos();
  return r.fetchReviews();
});

export const dbSaveReviews = createServerFn({ method: "POST" })
  .validator(z.array(z.any()))
  .handler(async ({ data }) => {
    const r = await repos();
    await r.upsertReviews(data);
    return { ok: true };
  });

export const dbGetNewsletter = createServerFn({ method: "GET" }).handler(async () => {
  const r = await repos();
  return r.fetchNewsletter();
});

export const dbSaveNewsletter = createServerFn({ method: "POST" })
  .validator(z.array(z.any()))
  .handler(async ({ data }) => {
    const r = await repos();
    await r.upsertNewsletter(data);
    return { ok: true };
  });

export const dbAddNewsletter = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().email() }))
  .handler(async ({ data }) => {
    const r = await repos();
    await r.addNewsletter(data.email);
    return { ok: true };
  });

export const dbGetPopup = createServerFn({ method: "GET" }).handler(async () => {
  const r = await repos();
  return r.fetchPopup();
});

export const dbSavePopup = createServerFn({ method: "POST" })
  .validator(z.any())
  .handler(async ({ data }) => {
    const r = await repos();
    await r.savePopup(data);
    return { ok: true };
  });

export const dbGetSeo = createServerFn({ method: "GET" }).handler(async () => {
  const r = await repos();
  return r.fetchSeo();
});

export const dbSaveSeo = createServerFn({ method: "POST" })
  .validator(z.any())
  .handler(async ({ data }) => {
    const r = await repos();
    await r.saveSeo(data);
    return { ok: true };
  });

export const dbGetAnalytics = createServerFn({ method: "GET" }).handler(async () => {
  const r = await repos();
  return r.fetchAnalytics();
});

export const dbSaveAnalytics = createServerFn({ method: "POST" })
  .validator(z.any())
  .handler(async ({ data }) => {
    const r = await repos();
    await r.saveAnalytics(data);
    return { ok: true };
  });

export const dbGetActivity = createServerFn({ method: "GET" }).handler(async () => {
  const r = await repos();
  return r.fetchActivity();
});

export const dbLogActivity = createServerFn({ method: "POST" })
  .validator(z.object({ who: z.string(), action: z.string(), detail: z.string() }))
  .handler(async ({ data }) => {
    const r = await repos();
    await r.logActivityDb(data.who, data.action, data.detail);
    return { ok: true };
  });

export const dbAdminLogin = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(1) }))
  .handler(async ({ data }) => {
    const r = await repos();
    const user = await r.verifyAdminPassword(data.password);
    if (!user) return { ok: false as const, user: null };
    return { ok: true as const, user };
  });

export const dbSeedProductsIfEmpty = createServerFn({ method: "POST" })
  .validator(z.object({ products: z.array(z.any()), catalog: z.array(z.any()).optional() }))
  .handler(async ({ data }) => {
    const r = await repos();
    const n = await r.productsCount();
    if (n > 0) return { seeded: false, count: n };
    if (data.catalog?.length) await r.upsertCategories(data.catalog);
    await r.upsertProducts(data.products);
    return { seeded: true, count: data.products.length };
  });
