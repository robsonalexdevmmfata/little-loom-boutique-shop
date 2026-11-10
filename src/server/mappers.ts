import type { DbProduct } from "./db";

export type ApiProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory?: string;
  price: number;
  promo?: number;
  stock: number;
  stockBySize?: Record<string, number>;
  image: string;
  gallery?: string[];
  description: string;
  details?: string[];
  composition?: string;
  care?: string;
  color?: string;
  sku?: string;
  sizes: string[];
  showInVitrine?: boolean;
  featured?: boolean;
  isNew?: boolean;
  best?: boolean;
  status: "publicado" | "rascunho";
  seoTitle?: string;
  seoDescription?: string;
};

export function mapProduct(p: DbProduct): ApiProduct {
  const stockBySize = p.stock_by_size && Object.keys(p.stock_by_size).length ? p.stock_by_size : undefined;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    subcategory: p.subcategory ?? undefined,
    price: Number(p.price),
    promo: p.promo != null ? Number(p.promo) : undefined,
    stock: p.stock,
    stockBySize,
    image: p.image,
    gallery: p.gallery?.length ? p.gallery : undefined,
    description: p.description,
    details: p.details?.length ? p.details : undefined,
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
  };
}
