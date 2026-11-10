import { sql, type DbProduct } from "./db";
import { mapProduct, type ApiProduct } from "./mappers";

export async function fetchAllProducts(): Promise<ApiProduct[]> {
  const rows = await sql<DbProduct[]>`SELECT * FROM products ORDER BY name ASC`;
  return rows.map(mapProduct);
}

export async function fetchPublishedProducts(): Promise<ApiProduct[]> {
  const rows = await sql<DbProduct[]>`
    SELECT * FROM products WHERE status = 'publicado' ORDER BY updated_at DESC
  `;
  return rows.map(mapProduct);
}

export async function upsertProducts(products: ApiProduct[]) {
  await sql.begin(async (tx) => {
    const keep = products.map((p) => p.id);
    if (keep.length) {
      await tx`DELETE FROM products WHERE NOT (id = ANY(${keep}))`;
    } else {
      await tx`DELETE FROM products`;
    }
    for (const p of products) {
      await tx`
        INSERT INTO products (
          id, slug, name, category, subcategory, price, promo, stock, stock_by_size,
          image, gallery, description, details, composition, care, color, sku, sizes,
          show_in_vitrine, featured, is_new, best, status, seo_title, seo_description, updated_at
        ) VALUES (
          ${p.id}, ${p.slug}, ${p.name}, ${p.category}, ${p.subcategory ?? null},
          ${p.price}, ${p.promo ?? null}, ${p.stock}, ${sql.json(p.stockBySize ?? {})},
          ${p.image}, ${p.gallery ?? []}, ${p.description}, ${p.details ?? []},
          ${p.composition ?? null}, ${p.care ?? null}, ${p.color ?? null}, ${p.sku ?? null},
          ${p.sizes ?? []}, ${p.showInVitrine !== false}, ${!!p.featured}, ${!!p.isNew}, ${!!p.best},
          ${p.status}, ${p.seoTitle ?? null}, ${p.seoDescription ?? null}, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          slug = EXCLUDED.slug,
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          subcategory = EXCLUDED.subcategory,
          price = EXCLUDED.price,
          promo = EXCLUDED.promo,
          stock = EXCLUDED.stock,
          stock_by_size = EXCLUDED.stock_by_size,
          image = EXCLUDED.image,
          gallery = EXCLUDED.gallery,
          description = EXCLUDED.description,
          details = EXCLUDED.details,
          composition = EXCLUDED.composition,
          care = EXCLUDED.care,
          color = EXCLUDED.color,
          sku = EXCLUDED.sku,
          sizes = EXCLUDED.sizes,
          show_in_vitrine = EXCLUDED.show_in_vitrine,
          featured = EXCLUDED.featured,
          is_new = EXCLUDED.is_new,
          best = EXCLUDED.best,
          status = EXCLUDED.status,
          seo_title = EXCLUDED.seo_title,
          seo_description = EXCLUDED.seo_description,
          updated_at = NOW()
      `;
    }
  });
}

export type ApiCategory = { name: string; image: string; subcategories: string[] };

export async function fetchCategories(): Promise<ApiCategory[]> {
  const rows = await sql<{ name: string; image: string; subcategories: string[] }[]>`
    SELECT name, image, subcategories FROM categories ORDER BY sort_order ASC, name ASC
  `;
  return rows.map((r) => ({ name: r.name, image: r.image, subcategories: r.subcategories ?? [] }));
}

export async function upsertCategories(cats: ApiCategory[]) {
  await sql.begin(async (tx) => {
    const names = cats.map((c) => c.name);
    if (names.length) await tx`DELETE FROM categories WHERE NOT (name = ANY(${names}))`;
    else await tx`DELETE FROM categories`;
    let i = 0;
    for (const c of cats) {
      i += 1;
      await tx`
        INSERT INTO categories (id, name, image, subcategories, sort_order, updated_at)
        VALUES (${`cat-${c.name.toLowerCase().replace(/\s+/g, "-")}`}, ${c.name}, ${c.image}, ${c.subcategories}, ${i}, NOW())
        ON CONFLICT (name) DO UPDATE SET
          image = EXCLUDED.image,
          subcategories = EXCLUDED.subcategories,
          sort_order = EXCLUDED.sort_order,
          updated_at = NOW()
      `;
    }
  });
}

export type ApiOrder = {
  id: string;
  customer: string;
  email: string;
  phone?: string;
  total: number;
  status: "Aguardando pagamento" | "Pago" | "Enviado" | "Entregue";
  date: string;
  items: number;
  payment?: "PIX" | "Cartão" | "Boleto";
  city?: string;
  note?: string;
  trackingCode?: string;
  trackingUrl?: string;
  shippingLabel?: string;
};

export async function fetchOrders(): Promise<ApiOrder[]> {
  const rows = await sql<
    {
      id: string;
      customer: string;
      email: string;
      phone: string | null;
      total: string;
      status: ApiOrder["status"];
      order_date: string;
      items_count: number;
      payment: ApiOrder["payment"] | null;
      city: string | null;
      note: string | null;
      tracking_code: string | null;
      tracking_url: string | null;
      shipping_label: string | null;
    }[]
  >`SELECT * FROM orders ORDER BY order_date DESC, created_at DESC`;
  return rows.map((o) => ({
    id: o.id,
    customer: o.customer,
    email: o.email,
    phone: o.phone ?? undefined,
    total: Number(o.total),
    status: o.status,
    date: String(o.order_date).slice(0, 10),
    items: o.items_count,
    payment: o.payment ?? undefined,
    city: o.city ?? undefined,
    note: o.note ?? undefined,
    trackingCode: o.tracking_code ?? undefined,
    trackingUrl: o.tracking_url ?? undefined,
    shippingLabel: o.shipping_label ?? undefined,
  }));
}

export async function upsertOrders(orders: ApiOrder[]) {
  await sql.begin(async (tx) => {
    const ids = orders.map((o) => o.id);
    if (ids.length) await tx`DELETE FROM orders WHERE NOT (id = ANY(${ids}))`;
    else await tx`DELETE FROM orders`;
    for (const o of orders) {
      await tx`
        INSERT INTO orders (
          id, customer, email, phone, total, status, order_date, items_count,
          payment, city, note, tracking_code, tracking_url, shipping_label, updated_at
        ) VALUES (
          ${o.id}, ${o.customer}, ${o.email}, ${o.phone ?? null}, ${o.total}, ${o.status},
          ${o.date}::date, ${o.items}, ${o.payment ?? null}, ${o.city ?? null}, ${o.note ?? null},
          ${o.trackingCode ?? null}, ${o.trackingUrl ?? null}, ${o.shippingLabel ?? null}, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          customer = EXCLUDED.customer,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          total = EXCLUDED.total,
          status = EXCLUDED.status,
          order_date = EXCLUDED.order_date,
          items_count = EXCLUDED.items_count,
          payment = EXCLUDED.payment,
          city = EXCLUDED.city,
          note = EXCLUDED.note,
          tracking_code = EXCLUDED.tracking_code,
          tracking_url = EXCLUDED.tracking_url,
          shipping_label = EXCLUDED.shipping_label,
          updated_at = NOW()
      `;
    }
  });
}

export async function insertOrder(order: ApiOrder, lines?: { productId: string; name: string; size: string; qty: number; unitPrice: number }[]) {
  await sql`
    INSERT INTO orders (
      id, customer, email, phone, total, status, order_date, items_count,
      payment, city, note, tracking_code, tracking_url, shipping_label
    ) VALUES (
      ${order.id}, ${order.customer}, ${order.email}, ${order.phone ?? null}, ${order.total}, ${order.status},
      ${order.date}::date, ${order.items}, ${order.payment ?? null}, ${order.city ?? null}, ${order.note ?? null},
      ${order.trackingCode ?? null}, ${order.trackingUrl ?? null}, ${order.shippingLabel ?? null}
    )
    ON CONFLICT (id) DO NOTHING
  `;
  if (lines?.length) {
    for (const l of lines) {
      await sql`
        INSERT INTO order_items (order_id, product_id, product_name, size, qty, unit_price)
        VALUES (${order.id}, ${l.productId}, ${l.name}, ${l.size}, ${l.qty}, ${l.unitPrice})
      `;
    }
  }
}

export type ApiCoupon = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  active: boolean;
  minOrder: number;
  note?: string;
};

export async function fetchCoupons(): Promise<ApiCoupon[]> {
  const rows = await sql<
    { id: string; code: string; type: "percent" | "fixed"; value: string; active: boolean; min_order: string; note: string | null }[]
  >`SELECT * FROM coupons ORDER BY code ASC`;
  return rows.map((c) => ({
    id: c.id,
    code: c.code,
    type: c.type,
    value: Number(c.value),
    active: c.active,
    minOrder: Number(c.min_order),
    note: c.note ?? undefined,
  }));
}

export async function upsertCoupons(coupons: ApiCoupon[]) {
  await sql.begin(async (tx) => {
    const ids = coupons.map((c) => c.id);
    if (ids.length) await tx`DELETE FROM coupons WHERE NOT (id = ANY(${ids}))`;
    else await tx`DELETE FROM coupons`;
    for (const c of coupons) {
      await tx`
        INSERT INTO coupons (id, code, type, value, active, min_order, note)
        VALUES (${c.id}, ${c.code}, ${c.type}, ${c.value}, ${c.active}, ${c.minOrder}, ${c.note ?? null})
        ON CONFLICT (id) DO UPDATE SET
          code = EXCLUDED.code, type = EXCLUDED.type, value = EXCLUDED.value,
          active = EXCLUDED.active, min_order = EXCLUDED.min_order, note = EXCLUDED.note
      `;
    }
  });
}

export async function fetchCommerce() {
  const rows = await sql`
    SELECT * FROM commerce_config WHERE id = 1 LIMIT 1
  `;
  const c = rows[0] as
    | {
        store_name: string;
        store_url_label: string;
        free_shipping_from: string;
        flat_shipping: string;
        support_email: string;
        low_stock_threshold: number;
        maintenance_mode: boolean;
        maintenance_message: string;
      }
    | undefined;
  if (!c) return null;
  return {
    storeName: c.store_name,
    storeUrlLabel: c.store_url_label,
    freeShippingFrom: Number(c.free_shipping_from),
    flatShipping: Number(c.flat_shipping),
    supportEmail: c.support_email,
    lowStockThreshold: c.low_stock_threshold,
    maintenanceMode: c.maintenance_mode,
    maintenanceMessage: c.maintenance_message,
  };
}

export async function saveCommerce(cfg: {
  storeName: string;
  storeUrlLabel: string;
  freeShippingFrom: number;
  flatShipping: number;
  supportEmail: string;
  lowStockThreshold: number;
  maintenanceMode: boolean;
  maintenanceMessage: string;
}) {
  await sql`
    INSERT INTO commerce_config (
      id, store_name, store_url_label, free_shipping_from, flat_shipping,
      support_email, low_stock_threshold, maintenance_mode, maintenance_message, updated_at
    ) VALUES (
      1, ${cfg.storeName}, ${cfg.storeUrlLabel}, ${cfg.freeShippingFrom}, ${cfg.flatShipping},
      ${cfg.supportEmail}, ${cfg.lowStockThreshold}, ${cfg.maintenanceMode}, ${cfg.maintenanceMessage}, NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      store_name = EXCLUDED.store_name,
      store_url_label = EXCLUDED.store_url_label,
      free_shipping_from = EXCLUDED.free_shipping_from,
      flat_shipping = EXCLUDED.flat_shipping,
      support_email = EXCLUDED.support_email,
      low_stock_threshold = EXCLUDED.low_stock_threshold,
      maintenance_mode = EXCLUDED.maintenance_mode,
      maintenance_message = EXCLUDED.maintenance_message,
      updated_at = NOW()
  `;
}

export async function fetchSettingsJson(): Promise<Record<string, unknown> | null> {
  const rows = await sql<{ data: Record<string, unknown> }[]>`
    SELECT data FROM store_settings WHERE id = 1 LIMIT 1
  `;
  return rows[0]?.data ?? null;
}

export async function saveSettingsJson(data: Record<string, unknown>) {
  await sql`
    INSERT INTO store_settings (id, data, updated_at)
    VALUES (1, ${sql.json(data)}, NOW())
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
  `;
}

export async function fetchFaq() {
  const rows = await sql<{ id: string; question: string; answer: string }[]>`
    SELECT id, question, answer FROM faq_items ORDER BY sort_order ASC, created_at ASC
  `;
  return rows;
}

export async function upsertFaq(items: { id: string; question: string; answer: string }[]) {
  await sql.begin(async (tx) => {
    const ids = items.map((i) => i.id);
    if (ids.length) await tx`DELETE FROM faq_items WHERE NOT (id = ANY(${ids}))`;
    else await tx`DELETE FROM faq_items`;
    let i = 0;
    for (const item of items) {
      i += 1;
      await tx`
        INSERT INTO faq_items (id, question, answer, sort_order)
        VALUES (${item.id}, ${item.question}, ${item.answer}, ${i})
        ON CONFLICT (id) DO UPDATE SET question = EXCLUDED.question, answer = EXCLUDED.answer, sort_order = EXCLUDED.sort_order
      `;
    }
  });
}

export async function fetchReviews() {
  const rows = await sql<
    {
      id: string;
      product_id: string | null;
      author: string;
      rating: number;
      text: string;
      review_date: string;
      approved: boolean;
      avatar: string | null;
    }[]
  >`SELECT * FROM reviews ORDER BY created_at DESC`;
  return rows.map((r) => ({
    id: r.id,
    productId: r.product_id ?? "",
    author: r.author,
    rating: r.rating,
    text: r.text,
    date: String(r.review_date).slice(0, 10),
    approved: r.approved,
    avatar: r.avatar ?? undefined,
  }));
}

export async function upsertReviews(
  reviews: { id: string; productId: string; author: string; rating: number; text: string; date: string; approved: boolean; avatar?: string }[],
) {
  await sql.begin(async (tx) => {
    const ids = reviews.map((r) => r.id);
    if (ids.length) await tx`DELETE FROM reviews WHERE NOT (id = ANY(${ids}))`;
    else await tx`DELETE FROM reviews`;
    for (const r of reviews) {
      await tx`
        INSERT INTO reviews (id, product_id, author, rating, text, review_date, approved, avatar)
        VALUES (
          ${r.id}, ${r.productId || null}, ${r.author}, ${r.rating}, ${r.text},
          ${r.date}::date, ${r.approved}, ${r.avatar ?? null}
        )
        ON CONFLICT (id) DO UPDATE SET
          product_id = EXCLUDED.product_id,
          author = EXCLUDED.author,
          rating = EXCLUDED.rating,
          text = EXCLUDED.text,
          review_date = EXCLUDED.review_date,
          approved = EXCLUDED.approved,
          avatar = EXCLUDED.avatar
      `;
    }
  });
}

export async function fetchNewsletter() {
  const rows = await sql<{ email: string; subscribed_at: string }[]>`
    SELECT email, subscribed_at::text FROM newsletter_subs ORDER BY subscribed_at DESC
  `;
  return rows.map((r) => ({ email: r.email, date: String(r.subscribed_at).slice(0, 10) }));
}

export async function upsertNewsletter(list: { email: string; date: string }[]) {
  await sql.begin(async (tx) => {
    await tx`DELETE FROM newsletter_subs`;
    for (const n of list) {
      await tx`
        INSERT INTO newsletter_subs (email, subscribed_at)
        VALUES (${n.email}, ${n.date}::date)
        ON CONFLICT (email) DO NOTHING
      `;
    }
  });
}

export async function addNewsletter(email: string) {
  await sql`
    INSERT INTO newsletter_subs (email, subscribed_at)
    VALUES (${email.toLowerCase()}, CURRENT_DATE)
    ON CONFLICT (email) DO NOTHING
  `;
}

export async function fetchPopup() {
  const rows = await sql`
    SELECT * FROM campaign_popup WHERE id = 1 LIMIT 1
  `;
  const p = rows[0] as
    | {
        active: boolean;
        title: string;
        text: string;
        cta: string;
        cta_href: string;
        dismiss_days: number;
        home_only: boolean;
        delay_ms: number;
        coupon_code: string | null;
      }
    | undefined;
  if (!p) return null;
  return {
    active: p.active,
    title: p.title,
    text: p.text,
    cta: p.cta,
    ctaHref: p.cta_href,
    dismissDays: p.dismiss_days,
    homeOnly: p.home_only,
    delayMs: p.delay_ms,
    couponCode: p.coupon_code ?? "",
  };
}

export async function savePopup(cfg: {
  active: boolean;
  title: string;
  text: string;
  cta: string;
  ctaHref: string;
  dismissDays: number;
  homeOnly?: boolean;
  delayMs?: number;
  couponCode?: string;
}) {
  await sql`
    INSERT INTO campaign_popup (
      id, active, title, text, cta, cta_href, dismiss_days, home_only, delay_ms, coupon_code, updated_at
    ) VALUES (
      1, ${cfg.active}, ${cfg.title}, ${cfg.text}, ${cfg.cta}, ${cfg.ctaHref},
      ${cfg.dismissDays}, ${cfg.homeOnly !== false}, ${cfg.delayMs ?? 1600}, ${cfg.couponCode ?? null}, NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      active = EXCLUDED.active, title = EXCLUDED.title, text = EXCLUDED.text,
      cta = EXCLUDED.cta, cta_href = EXCLUDED.cta_href, dismiss_days = EXCLUDED.dismiss_days,
      home_only = EXCLUDED.home_only, delay_ms = EXCLUDED.delay_ms, coupon_code = EXCLUDED.coupon_code,
      updated_at = NOW()
  `;
}

export async function fetchSeo() {
  const rows = await sql`
    SELECT * FROM seo_config WHERE id = 1 LIMIT 1
  `;
  const s = rows[0] as
    | {
        home_title: string;
        home_description: string;
        product_title_suffix: string;
        default_og_image: string;
      }
    | undefined;
  if (!s) return null;
  return {
    homeTitle: s.home_title,
    homeDescription: s.home_description,
    productTitleSuffix: s.product_title_suffix,
    defaultOgImage: s.default_og_image,
  };
}

export async function saveSeo(cfg: {
  homeTitle: string;
  homeDescription: string;
  productTitleSuffix: string;
  defaultOgImage: string;
}) {
  await sql`
    INSERT INTO seo_config (id, home_title, home_description, product_title_suffix, default_og_image, updated_at)
    VALUES (1, ${cfg.homeTitle}, ${cfg.homeDescription}, ${cfg.productTitleSuffix}, ${cfg.defaultOgImage}, NOW())
    ON CONFLICT (id) DO UPDATE SET
      home_title = EXCLUDED.home_title,
      home_description = EXCLUDED.home_description,
      product_title_suffix = EXCLUDED.product_title_suffix,
      default_og_image = EXCLUDED.default_og_image,
      updated_at = NOW()
  `;
}

export async function fetchAnalytics() {
  const rows = await sql`
    SELECT * FROM analytics_config WHERE id = 1 LIMIT 1
  `;
  const a = rows[0] as { enabled: boolean; ga_id: string; gtm_id: string } | undefined;
  if (!a) return null;
  return { enabled: a.enabled, gaId: a.ga_id, gtmId: a.gtm_id };
}

export async function saveAnalytics(cfg: { enabled: boolean; gaId: string; gtmId: string }) {
  await sql`
    INSERT INTO analytics_config (id, enabled, ga_id, gtm_id, updated_at)
    VALUES (1, ${cfg.enabled}, ${cfg.gaId}, ${cfg.gtmId}, NOW())
    ON CONFLICT (id) DO UPDATE SET
      enabled = EXCLUDED.enabled, ga_id = EXCLUDED.ga_id, gtm_id = EXCLUDED.gtm_id, updated_at = NOW()
  `;
}

export async function fetchActivity() {
  const rows = await sql<{ id: string; at: string; who: string; action: string; detail: string }[]>`
    SELECT id, at::text, who, action, detail FROM activity_log ORDER BY at DESC LIMIT 200
  `;
  return rows;
}

export async function logActivityDb(who: string, action: string, detail: string) {
  await sql`
    INSERT INTO activity_log (id, who, action, detail)
    VALUES (${`a-${Date.now()}`}, ${who}, ${action}, ${detail})
  `;
}

export async function fetchAdminUsers() {
  const rows = await sql<{ id: string; name: string; role: "dono" | "atendente" }[]>`
    SELECT id, name, role FROM admin_users ORDER BY name ASC
  `;
  return rows.map((u) => ({ ...u, password: "••••" }));
}

export async function verifyAdminPassword(password: string) {
  const rows = await sql<{ id: string; name: string; role: "dono" | "atendente" }[]>`
    SELECT id, name, role FROM admin_users
    WHERE password_hash = crypt(${password}, password_hash)
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function decrementStock(
  lines: { productId: string; size: string; qty: number }[],
) {
  for (const l of lines) {
    const rows = await sql<DbProduct[]>`SELECT * FROM products WHERE id = ${l.productId} LIMIT 1`;
    const p = rows[0];
    if (!p) continue;
    const bySize = p.stock_by_size && Object.keys(p.stock_by_size).length ? { ...p.stock_by_size } : null;
    if (bySize && l.size in bySize) {
      bySize[l.size] = Math.max(0, (bySize[l.size] ?? 0) - l.qty);
      const total = Object.values(bySize).reduce((a, n) => a + Number(n || 0), 0);
      await sql`UPDATE products SET stock_by_size = ${sql.json(bySize)}, stock = ${total}, updated_at = NOW() WHERE id = ${l.productId}`;
    } else {
      await sql`UPDATE products SET stock = GREATEST(0, stock - ${l.qty}), updated_at = NOW() WHERE id = ${l.productId}`;
    }
  }
}

export async function productsCount() {
  const rows = await sql<{ n: string }[]>`SELECT COUNT(*)::text AS n FROM products`;
  return Number(rows[0]?.n ?? 0);
}
