import { useEffect, useState } from "react";
import heroImg from "@/assets/slide_principal.jpg";
import conjuntosImg from "@/assets/cat_conjuntos.jpg";
import vestidosImg from "@/assets/cat_vestidos.jpg";
import macacoesImg from "@/assets/cat_macacoes.jpg";
import blazersImg from "@/assets/cat_blazers.jpg";
const hero = { url: heroImg };
const conjuntos = { url: conjuntosImg };
const vestidos = { url: vestidosImg };
const macacoes = { url: macacoesImg };
const blazers = { url: blazersImg };

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  promo?: number | undefined;
  stock: number;
  image: string;
  description: string;
  sizes: string[];
  isNew?: boolean;
  best?: boolean;
  status: "publicado" | "rascunho";
};
export type Order = {
  id: string;
  customer: string;
  email: string;
  total: number;
  status: "Aguardando pagamento" | "Pago" | "Enviado" | "Entregue";
  date: string;
  items: number;
};
export type Settings = {
  promoText: string;
  promoActive: boolean;
  heroTitle: string;
  heroAccent: string;
  heroButton: string;
  editorialTitle: string;
};
export type CartItem = { productId: string; size: string; qty: number };

export const images = { hero: hero.url, conjuntos: conjuntos.url, vestidos: vestidos.url, macacoes: macacoes.url, blazers: blazers.url };

export const categories = [
  { name: "Conjuntos", image: conjuntos.url },
  { name: "Vestidos", image: vestidos.url },
  { name: "Macacões", image: macacoes.url },
  { name: "Blazers", image: blazers.url },
];

const S = ["PP", "P", "M", "G"];
const seedProducts: Product[] = [
  { id: "1", slug: "conjunto-tomara-que-caia-bordo", name: "Conjunto Tomara que Caia Bordô", category: "Conjuntos", price: 489.9, promo: 419.9, stock: 12, image: conjuntos.url, description: "Top tomara que caia estruturado com calça de alfaiataria cintura alta.", sizes: S, isNew: true, status: "publicado" },
  { id: "2", slug: "vestido-midi-capa-vinho", name: "Vestido Midi com Capa Vinho", category: "Vestidos", price: 629.9, stock: 8, image: vestidos.url, description: "Vestido midi ajustado com capa fluida de um ombro.", sizes: S, best: true, status: "publicado" },
  { id: "3", slug: "macacao-alfaiataria-bordo", name: "Macacão Alfaiataria Bordô", category: "Macacões", price: 559.9, promo: 479.9, stock: 5, image: macacoes.url, description: "Macacão de alças com cava americana e pernas amplas.", sizes: S, status: "publicado" },
  { id: "4", slug: "blazer-oversized-marsala", name: "Blazer Oversized Marsala", category: "Blazers", price: 699.9, stock: 10, image: blazers.url, description: "Blazer de alfaiataria oversized com calça combinando.", sizes: S, isNew: true, best: true, status: "publicado" },
  { id: "5", slug: "vestido-gola-alta-bordo", name: "Vestido Gola Alta Bordô", category: "Vestidos", price: 589.9, stock: 6, image: hero.url, description: "Vestido de gola alta e costas nuas em tecido acetinado.", sizes: S, isNew: true, status: "publicado" },
];
const seedOrders: Order[] = [
  { id: "RN-1042", customer: "Mariana Alves", email: "mariana@email.com", total: 909.8, status: "Pago", date: "2026-11-06", items: 2 },
  { id: "RN-1041", customer: "Juliana Costa", email: "ju.costa@email.com", total: 629.9, status: "Enviado", date: "2026-11-05", items: 1 },
  { id: "RN-1040", customer: "Camila Rocha", email: "camila.r@email.com", total: 479.9, status: "Aguardando pagamento", date: "2026-11-05", items: 1 },
  { id: "RN-1039", customer: "Beatriz Lima", email: "bia@email.com", total: 1259.7, status: "Entregue", date: "2026-11-02", items: 3 },
];
const seedSettings: Settings = {
  promoText: "Primeira compra? Ganhe 10% OFF com o cupom BEMVINDA",
  promoActive: true,
  heroTitle: "Uma roupa que chega no lugar, sem você precisar fazer",
  heroAccent: "escândalo.",
  heroButton: "Descubra a coleção",
  editorialTitle: "Elegância é se sentir bem.",
};

function useLS<T>(key: string, seed: T) {
  const [v, setV] = useState<T>(seed);
  useEffect(() => {
    const raw = localStorage.getItem(key);
    if (raw) setV(JSON.parse(raw));
    const h = () => { const r = localStorage.getItem(key); if (r) setV(JSON.parse(r)); };
    window.addEventListener("rn-store", h);
    return () => window.removeEventListener("rn-store", h);
  }, [key]);
  const set = (next: T) => {
    localStorage.setItem(key, JSON.stringify(next));
    setV(next);
    window.dispatchEvent(new Event("rn-store"));
  };
  return [v, set] as const;
}

export const useProducts = () => useLS("rn-products-v2", seedProducts);
export const useOrders = () => useLS("rn-orders", seedOrders);
export const useSettings = () => useLS("rn-settings", seedSettings);
export const useCart = () => useLS<CartItem[]>("rn-cart", []);

export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const ADMIN_PASSWORD = "1234";
