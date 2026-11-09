import { useEffect, useState } from "react";

function useLS<T>(key: string, seed: T) {
  const [v, setV] = useState<T>(seed);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setV(JSON.parse(raw) as T);
    } catch {
      /* ignore */
    }
    const h = () => {
      try {
        const r = localStorage.getItem(key);
        if (r) setV(JSON.parse(r) as T);
      } catch {
        /* ignore */
      }
    };
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

export type FaqItem = { id: string; question: string; answer: string };

export type Review = {
  id: string;
  productId: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  approved: boolean;
};

export type NewsletterSub = { email: string; date: string };

export type ActivityEntry = {
  id: string;
  at: string;
  who: string;
  action: string;
  detail: string;
};

export type AdminUser = {
  id: string;
  name: string;
  role: "dono" | "atendente";
  password: string;
};

export type AnalyticsConfig = {
  enabled: boolean;
  gaId: string;
  gtmId: string;
};

export type CampaignPopup = {
  active: boolean;
  title: string;
  text: string;
  cta: string;
  ctaHref: string;
  dismissDays: number;
};

export type SeoConfig = {
  homeTitle: string;
  homeDescription: string;
  productTitleSuffix: string;
  defaultOgImage: string;
};

export type AbandonedCartSnap = {
  id: string;
  updatedAt: string;
  items: { name: string; size: string; qty: number; productId: string }[];
  totalHint: number;
  email?: string;
  phone?: string;
};

export const seedFaq: FaqItem[] = [
  {
    id: "f1",
    question: "Qual o prazo de entrega?",
    answer: "Após a confirmação do pagamento, o envio sai em até 2 dias úteis. O prazo Melhor Envio aparece no checkout.",
  },
  {
    id: "f2",
    question: "Posso trocar o tamanho?",
    answer: "Sim. Trocas em até 7 dias após o recebimento, com a peça sem uso e com etiquetas. Fale pelo WhatsApp.",
  },
  {
    id: "f3",
    question: "Quais formas de pagamento?",
    answer: "PIX, cartão em até 12x e boleto via Mercado Pago.",
  },
];

export const seedReviews: Review[] = [
  {
    id: "r1",
    productId: "1",
    author: "Fernanda D.",
    rating: 5,
    text: "Caimento impecável e tecido nobre. Chegou rápido.",
    date: new Date().toISOString().slice(0, 10),
    approved: true,
  },
  {
    id: "r2",
    productId: "2",
    author: "Larissa M.",
    rating: 4,
    text: "Linda peça. Só pediria mais opções de tamanho.",
    date: new Date().toISOString().slice(0, 10),
    approved: true,
  },
];

export const seedAdminUsers: AdminUser[] = [
  { id: "u1", name: "Dono", role: "dono", password: "1234" },
  { id: "u2", name: "Atendimento", role: "atendente", password: "loja" },
];

export const seedAnalytics: AnalyticsConfig = {
  enabled: false,
  gaId: "",
  gtmId: "",
};

export const seedPopup: CampaignPopup = {
  active: false,
  title: "Bem-vinda à REIS NOIR",
  text: "Ganhe 10% na primeira compra com o cupom BEMVINDA.",
  cta: "Ver coleção",
  ctaHref: "/#novidades",
  dismissDays: 7,
};

export const seedSeo: SeoConfig = {
  homeTitle: "REIS NOIR — Moda feminina sofisticada",
  homeDescription: "Conjuntos, vestidos, macacões e blazers com presença. Frete para todo o Brasil.",
  productTitleSuffix: "— REIS NOIR",
  defaultOgImage: "https://little-loom-boutique-shop.vercel.app/og-image.jpg",
};

export const useFaq = () => useLS("rn-faq-v1", seedFaq);
export const useReviews = () => useLS("rn-reviews-v1", seedReviews);
export const useNewsletter = () => useLS<NewsletterSub[]>("rn-newsletter-v1", []);
export const useActivity = () => useLS<ActivityEntry[]>("rn-activity-v1", []);
export const useAdminUsers = () => useLS("rn-admin-users-v1", seedAdminUsers);
export const useAnalytics = () => useLS("rn-analytics-v1", seedAnalytics);
export const useCampaignPopup = () => useLS("rn-popup-v1", seedPopup);
export const useSeo = () => useLS("rn-seo-v1", seedSeo);
export const useAbandonedCarts = () => useLS<AbandonedCartSnap[]>("rn-abandoned-v1", []);

export function logActivity(who: string, action: string, detail: string) {
  try {
    const raw = localStorage.getItem("rn-activity-v1");
    const prev = raw ? (JSON.parse(raw) as ActivityEntry[]) : [];
    const entry: ActivityEntry = {
      id: `a-${Date.now()}`,
      at: new Date().toISOString(),
      who,
      action,
      detail,
    };
    const next = [entry, ...prev].slice(0, 200);
    localStorage.setItem("rn-activity-v1", JSON.stringify(next));
    window.dispatchEvent(new Event("rn-store"));
  } catch {
    /* ignore */
  }
}

export function getAdminSession(): { name: string; role: AdminUser["role"] } | null {
  try {
    const raw = sessionStorage.getItem("rn-admin-user");
    if (!raw) return null;
    return JSON.parse(raw) as { name: string; role: AdminUser["role"] };
  } catch {
    return null;
  }
}

export function setAdminSession(user: AdminUser) {
  sessionStorage.setItem("rn-admin", "1");
  sessionStorage.setItem("rn-admin-user", JSON.stringify({ name: user.name, role: user.role }));
}

export function clearAdminSession() {
  sessionStorage.removeItem("rn-admin");
  sessionStorage.removeItem("rn-admin-user");
}

export function findAdminUser(users: AdminUser[], password: string) {
  return users.find((u) => u.password === password) ?? null;
}

export function snapshotAbandonedCart(snap: Omit<AbandonedCartSnap, "id" | "updatedAt"> & { id?: string }) {
  try {
    const raw = localStorage.getItem("rn-abandoned-v1");
    const prev = raw ? (JSON.parse(raw) as AbandonedCartSnap[]) : [];
    const id = snap.id || "browser";
    const entry: AbandonedCartSnap = {
      id,
      updatedAt: new Date().toISOString(),
      items: snap.items,
      totalHint: snap.totalHint,
      email: snap.email,
      phone: snap.phone,
    };
    const next = [entry, ...prev.filter((x) => x.id !== id)].slice(0, 50);
    localStorage.setItem("rn-abandoned-v1", JSON.stringify(next));
    window.dispatchEvent(new Event("rn-store"));
  } catch {
    /* ignore */
  }
}

export function clearAbandonedCart(id = "browser") {
  try {
    const raw = localStorage.getItem("rn-abandoned-v1");
    const prev = raw ? (JSON.parse(raw) as AbandonedCartSnap[]) : [];
    localStorage.setItem("rn-abandoned-v1", JSON.stringify(prev.filter((x) => x.id !== id)));
    window.dispatchEvent(new Event("rn-store"));
  } catch {
    /* ignore */
  }
}

export const seedCmsExtrasBackup = {
  faq: seedFaq,
  reviews: seedReviews,
  newsletter: [] as NewsletterSub[],
  activity: [] as ActivityEntry[],
  adminUsers: seedAdminUsers,
  analytics: seedAnalytics,
  popup: seedPopup,
  seo: seedSeo,
};
