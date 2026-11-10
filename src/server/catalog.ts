import { sql, type DbProduct } from "./db";

export async function listPublishedProducts() {
  return sql<DbProduct[]>`
    SELECT *
    FROM products
    WHERE status = 'publicado'
    ORDER BY updated_at DESC
  `;
}

export async function listAllProducts() {
  return sql<DbProduct[]>`
    SELECT *
    FROM products
    ORDER BY name ASC
  `;
}

export async function getProductBySlug(slug: string) {
  const rows = await sql<DbProduct[]>`
    SELECT *
    FROM products
    WHERE slug = ${slug}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function listCategories() {
  return sql<{ id: string; name: string; image: string; subcategories: string[]; sort_order: number }[]>`
    SELECT id, name, image, subcategories, sort_order
    FROM categories
    ORDER BY sort_order ASC, name ASC
  `;
}

export async function listApprovedReviews(limit = 12) {
  return sql<
    {
      id: string;
      product_id: string | null;
      author: string;
      rating: number;
      text: string;
      review_date: string;
      avatar: string | null;
    }[]
  >`
    SELECT id, product_id, author, rating, text, review_date::text, avatar
    FROM reviews
    WHERE approved = TRUE
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
}

export async function listFaq() {
  return sql<{ id: string; question: string; answer: string }[]>`
    SELECT id, question, answer
    FROM faq_items
    ORDER BY sort_order ASC, created_at ASC
  `;
}

export async function getCampaignPopup() {
  const rows = await sql`
    SELECT *
    FROM campaign_popup
    WHERE id = 1
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function getCommerceConfig() {
  const rows = await sql`
    SELECT *
    FROM commerce_config
    WHERE id = 1
    LIMIT 1
  `;
  return rows[0] ?? null;
}
