import { useEffect, useState } from "react";
import type { Product } from "@/lib/store";
import { downloadCsv } from "@/lib/admin-utils";

export type MetaAdsConfig = {
  enabled: boolean;
  pixelId: string;
  catalogId: string;
  datasetId: string;
  notes: string;
};

export const seedMetaAds: MetaAdsConfig = {
  enabled: false,
  pixelId: "",
  catalogId: "",
  datasetId: "",
  notes: "",
};

const KEY = "rn-meta-ads-v1";

function readMeta(): MetaAdsConfig {
  if (typeof window === "undefined") return seedMetaAds;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...seedMetaAds, ...(JSON.parse(raw) as MetaAdsConfig) };
  } catch {
    /* ignore */
  }
  const envId = import.meta.env.VITE_META_PIXEL_ID as string | undefined;
  if (envId) return { ...seedMetaAds, enabled: true, pixelId: envId };
  return seedMetaAds;
}

export function useMetaAds() {
  const [v, setV] = useState<MetaAdsConfig>(seedMetaAds);
  useEffect(() => {
    setV(readMeta());
    const h = () => setV(readMeta());
    window.addEventListener("rn-store", h);
    return () => window.removeEventListener("rn-store", h);
  }, []);
  const set = (next: MetaAdsConfig) => {
    localStorage.setItem(KEY, JSON.stringify(next));
    setV(next);
    window.dispatchEvent(new Event("rn-store"));
  };
  return [v, set] as const;
}

export function getMetaAdsConfig() {
  return readMeta();
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export function trackMeta(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const cfg = readMeta();
  if (!cfg.enabled || !cfg.pixelId.trim()) return;
  if (typeof window.fbq !== "function") return;
  if (params) window.fbq("track", event, params);
  else window.fbq("track", event);
}

export function metaContentFromProduct(p: Product) {
  return {
    content_ids: [p.sku || p.id],
    content_name: p.name,
    content_type: "product",
    content_category: p.category,
    value: p.promo ?? p.price,
    currency: "BRL",
  };
}

const STORE_BASE = "https://little-loom-boutique-shop.vercel.app";

export function exportMetaCatalogCsv(products: Product[]) {
  const rows = [
    ["id", "title", "description", "availability", "condition", "price", "link", "image_link", "brand", "item_group_id", "google_product_category"],
    ...products
      .filter((p) => p.status === "publicado")
      .map((p) => [
        p.sku || p.id,
        p.name,
        (p.seoDescription || p.description || p.name).replace(/\s+/g, " ").slice(0, 5000),
        p.stock > 0 ? "in stock" : "out of stock",
        "new",
        `${(p.promo ?? p.price).toFixed(2)} BRL`,
        `${STORE_BASE}/produto/${p.slug}`,
        p.image.startsWith("http") ? p.image : `${STORE_BASE}${p.image.startsWith("/") ? "" : "/"}${p.image}`,
        "REIS NOIR",
        p.category,
        "Apparel & Accessories > Clothing",
      ]),
  ];
  downloadCsv("meta-catalogo-reis-noir.csv", rows);
}
