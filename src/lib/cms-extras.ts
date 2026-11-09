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
  /** Foto do depoimento (URL) — exibida em círculo */
  avatar?: string;
};

/** Avatar fictício estável a partir do nome (fallback). */
export function reviewAvatar(r: Pick<Review, "author" | "avatar" | "id">) {
  if (r.avatar?.trim()) return r.avatar.trim();
  const seed = encodeURIComponent(r.author || r.id || "cliente");
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&backgroundColor=f2e8e2`;
}

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
  /** Só na home (recomendado) */
  homeOnly?: boolean;
  /** Atraso em ms antes de abrir */
  delayMs?: number;
  /** Cupom destacado no popup */
  couponCode?: string;
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
    author: "Fernanda Dias",
    rating: 5,
    text: "Caimento impecável e tecido nobre. Chegou rápido e a embalagem é um mimo.",
    date: new Date().toISOString().slice(0, 10),
    approved: true,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces",
  },
  {
    id: "r2",
    productId: "2",
    author: "Larissa Mendes",
    rating: 5,
    text: "Usei no jantar e todo mundo perguntou de onde era. Virei fã.",
    date: new Date().toISOString().slice(0, 10),
    approved: true,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces",
  },
  {
    id: "r3",
    productId: "3",
    author: "Camila Rocha",
    rating: 5,
    text: "Alfaiataria perfeita. Parece feita sob medida — e o vinho combina com tudo.",
    date: new Date().toISOString().slice(0, 10),
    approved: true,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces",
  },
  {
    id: "r4",
    productId: "4",
    author: "Beatriz Lima",
    rating: 4,
    text: "Blazer oversized dos sonhos. Troquei o tamanho fácil pelo WhatsApp.",
    date: new Date().toISOString().slice(0, 10),
    approved: true,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces",
  },
  {
    id: "r5",
    productId: "5",
    author: "Amanda Nunes",
    rating: 5,
    text: "Qualidade de boutique. Já indiquei pra três amigas.",
    date: new Date().toISOString().slice(0, 10),
    approved: true,
    avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&h=200&fit=crop&crop=faces",
  },
  {
    id: "r6",
    productId: "6",
    author: "Sofia Martins",
    rating: 5,
    text: "Chegou antes do prazo e o caimento é elegante sem esforço.",
    date: new Date().toISOString().slice(0, 10),
    approved: true,
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop&crop=faces",
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
  active: true,
  title: "Bem-vinda à REIS NOIR",
  text: "Ganhe 10% na primeira compra. Use o cupom no checkout e descubra a coleção.",
  cta: "Ver coleção",
  ctaHref: "/#novidades",
  dismissDays: 5,
  homeOnly: true,
  delayMs: 1600,
  couponCode: "BEMVINDA",
};

export const seedSeo: SeoConfig = {
  homeTitle: "REIS NOIR — Moda feminina sofisticada",
  homeDescription: "Conjuntos, vestidos, macacões e blazers com presença. Frete para todo o Brasil.",
  productTitleSuffix: "— REIS NOIR",
  defaultOgImage: "https://little-loom-boutique-shop.vercel.app/og-image.jpg",
};

export const useFaq = () => useLS("rn-faq-v1", seedFaq);
/** v2: avatares em círculo nos depoimentos */
export const useReviews = () => useLS("rn-reviews-v2", seedReviews);
export const useNewsletter = () => useLS<NewsletterSub[]>("rn-newsletter-v1", []);
export const useActivity = () => useLS<ActivityEntry[]>("rn-activity-v1", []);
export const useAdminUsers = () => useLS("rn-admin-users-v1", seedAdminUsers);
export const useAnalytics = () => useLS("rn-analytics-v1", seedAnalytics);
/** v2: ativo por padrão + homeOnly / cupom / delay */
export const useCampaignPopup = () => useLS("rn-popup-v2", seedPopup);
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
