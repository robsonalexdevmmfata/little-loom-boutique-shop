import { useEffect, useState } from "react";
import heroImg from "@/assets/slide_principal.jpg";
import conjuntosImg from "@/assets/cat_conjuntos.jpg";
import vestidosImg from "@/assets/cat_vestidos.jpg";
import macacoesImg from "@/assets/cat_macacoes.jpg";
import blazersImg from "@/assets/cat_blazers.jpg";
import slideVestido from "@/assets/slide_vestido.jpg";
import slideConjunto from "@/assets/slide_conjunto.jpg";
import slideBlazer from "@/assets/slide_blazer.jpg";
import slideMacacao from "@/assets/slide_macacao.jpg";

const hero = { url: heroImg };
const conjuntos = { url: conjuntosImg };
const vestidos = { url: vestidosImg };
const macacoes = { url: macacoesImg };
const blazers = { url: blazersImg };
const vestidoSlide = { url: slideVestido };
const conjuntoSlide = { url: slideConjunto };
const blazerSlide = { url: slideBlazer };
const macacaoSlide = { url: slideMacacao };

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory?: string;
  price: number;
  promo?: number | undefined;
  stock: number;
  image: string;
  gallery?: string[];
  description: string;
  details?: string[];
  composition?: string;
  care?: string;
  color?: string;
  sku?: string;
  sizes: string[];
  /** Aparece na grade principal da home */
  showInVitrine?: boolean;
  /** Aparece em Destaques */
  featured?: boolean;
  /** Badge + filtro Novidades */
  isNew?: boolean;
  /** Badge + filtro Mais vendidos */
  best?: boolean;
  status: "publicado" | "rascunho";
  seoTitle?: string;
  seoDescription?: string;
};

export type CatalogCategory = {
  name: string;
  image: string;
  subcategories: string[];
};

export type PaymentMethod = "PIX" | "Cartão" | "Boleto";

export type Order = {
  id: string;
  customer: string;
  email: string;
  phone?: string;
  total: number;
  status: "Aguardando pagamento" | "Pago" | "Enviado" | "Entregue";
  date: string;
  items: number;
  payment?: PaymentMethod;
  city?: string;
  note?: string;
};

export type BenefitCopy = { title: string; subtitle: string };

export type SlideCopy = {
  kicker: string;
  title: string;
  accent: string;
  text: string;
  button: string;
};

export type Settings = {
  promoText: string;
  promoActive: boolean;
  heroKicker: string;
  heroTitle: string;
  heroAccent: string;
  heroButton: string;
  slides: SlideCopy[];
  benefits: BenefitCopy[];
  collectionsEyebrow: string;
  collectionsTitle: string;
  productsTitle: string;
  editorialTitle: string;
  editorialKicker: string;
  editorialButton: string;
  footerAbout: string;
  footerWhatsappLabel: string;
  footerWhatsappNumber: string;
  footerInstagram: string;
  footerPoliciesTitle: string;
  footerPolicy1: string;
  footerPolicy2: string;
  footerPolicy3: string;
  footerPaymentTitle: string;
  footerPaymentText: string;
  footerCopyright: string;
};

export type CartItem = { productId: string; size: string; qty: number };

export const images = {
  hero: hero.url,
  conjuntos: conjuntos.url,
  vestidos: vestidos.url,
  macacoes: macacoes.url,
  blazers: blazers.url,
};

export const seedCatalog: CatalogCategory[] = [
  {
    name: "Conjuntos",
    image: conjuntos.url,
    subcategories: ["Tomara que caia", "Alfaiataria", "Saia midi", "Wide leg"],
  },
  {
    name: "Vestidos",
    image: vestidos.url,
    subcategories: ["Midi com capa", "Gola alta", "Slip", "Tubinho", "Assimétrico"],
  },
  {
    name: "Macacões",
    image: macacoes.url,
    subcategories: ["Alfaiataria", "Frente única", "Pantacourt", "Envelope"],
  },
  {
    name: "Blazers",
    image: blazers.url,
    subcategories: ["Oversized", "Alongado", "Cropped"],
  },
];

/** Compatível com telas que só precisam de nome/imagem. */
export const categories = seedCatalog.map(({ name, image }) => ({ name, image }));

const S = ["PP", "P", "M", "G"];
const carePadrao = "Lavar à mão ou limpeza a seco. Não usar alvejante. Passar em temperatura baixa pelo avesso.";
const compCrepe = "97% poliéster · 3% elastano · forro interno em acetato";
const compAlfaiataria = "70% viscose · 27% poliéster · 3% elastano";
const compAcetinado = "100% poliéster acetinado de alto brilho";

const seedProductsRaw: Product[] = [
  {
    id: "1",
    slug: "conjunto-tomara-que-caia-bordo",
    name: "Conjunto Tomara que Caia Bordô",
    category: "Conjuntos",
    price: 489.9,
    promo: 419.9,
    stock: 12,
    image: conjuntos.url,
    gallery: [conjuntos.url, conjuntoSlide.url, vestidos.url],
    description: "Top tomara que caia estruturado com calça de alfaiataria cintura alta. O dueto que define a assinatura REIS NOIR: sensualidade com corte limpo.",
    details: ["Top com elástico interno e bojo leve", "Calça cintura alta com zíper invisível", "Caimento fluido no movimento", "Modelagem pensada para marcar a cintura"],
    composition: compAlfaiataria,
    care: carePadrao,
    color: "Bordô",
    sku: "RN-CJ-001",
    sizes: S,
    isNew: true,
    status: "publicado",
  },
  {
    id: "2",
    slug: "vestido-midi-capa-vinho",
    name: "Vestido Midi com Capa Vinho",
    category: "Vestidos",
    price: 629.9,
    stock: 8,
    image: vestidos.url,
    gallery: [vestidos.url, vestidoSlide.url, hero.url],
    description: "Vestido midi ajustado com capa fluida de um ombro. Para entradas que ficam na memória — do jantar ao evento.",
    details: ["Comprimento midi", "Capa assimétrica removível no visual", "Decote estratégico", "Forro interno para conforto"],
    composition: compCrepe,
    care: carePadrao,
    color: "Vinho",
    sku: "RN-VS-002",
    sizes: S,
    best: true,
    status: "publicado",
  },
  {
    id: "3",
    slug: "macacao-alfaiataria-bordo",
    name: "Macacão Alfaiataria Bordô",
    category: "Macacões",
    price: 559.9,
    promo: 479.9,
    stock: 5,
    image: macacoes.url,
    gallery: [macacoes.url, macacaoSlide.url],
    description: "Macacão de alças com cava americana e pernas amplas. Uma peça, mil versões: do late afternoon ao after.",
    details: ["Cava americana", "Pernas amplas com movimento", "Cintura marcada", "Zíper posterior invisível"],
    composition: compAlfaiataria,
    care: carePadrao,
    color: "Bordô",
    sku: "RN-MC-003",
    sizes: S,
    status: "publicado",
  },
  {
    id: "4",
    slug: "blazer-oversized-marsala",
    name: "Blazer Oversized Marsala",
    category: "Blazers",
    price: 699.9,
    stock: 10,
    image: blazers.url,
    gallery: [blazers.url, blazerSlide.url],
    description: "Blazer de alfaiataria oversized com presença. Estrutura que empodera sem esforço — a peça-coroa do guarda-roupa.",
    details: ["Oversized com ombros estruturados", "Dois botões frontais", "Fenda traseira", "Bolso interno"],
    composition: compAlfaiataria,
    care: carePadrao,
    color: "Marsala",
    sku: "RN-BL-004",
    sizes: S,
    isNew: true,
    best: true,
    status: "publicado",
  },
  {
    id: "5",
    slug: "vestido-gola-alta-bordo",
    name: "Vestido Gola Alta Bordô",
    category: "Vestidos",
    price: 589.9,
    stock: 6,
    image: hero.url,
    gallery: [hero.url, vestidoSlide.url, vestidos.url],
    description: "Vestido de gola alta e costas nuas em tecido acetinado. O contraste entre contido e ousado — exatamente o espírito REIS NOIR.",
    details: ["Gola alta", "Costas abertas", "Tecido acetinado", "Caimento justo no corpo"],
    composition: compAcetinado,
    care: carePadrao,
    color: "Bordô",
    sku: "RN-VS-005",
    sizes: S,
    isNew: true,
    status: "publicado",
  },
  {
    id: "6",
    slug: "conjunto-alfaiataria-vinho",
    name: "Conjunto Alfaiataria Vinho",
    category: "Conjuntos",
    price: 549.9,
    stock: 9,
    image: conjuntoSlide.url,
    gallery: [conjuntoSlide.url, conjuntos.url, blazers.url],
    description: "Blusa estruturada e calça reta em tom vinho. Para reuniões que pedem presença e noites que pedem assinatura.",
    details: ["Blusa com ombro marcado", "Calça reta com cós alto", "Acabamento de alfaiataria", "Combina junto ou separado"],
    composition: compAlfaiataria,
    care: carePadrao,
    color: "Vinho",
    sku: "RN-CJ-006",
    sizes: S,
    best: true,
    status: "publicado",
  },
  {
    id: "7",
    slug: "vestido-slip-acetinado",
    name: "Vestido Slip Acetinado",
    category: "Vestidos",
    price: 459.9,
    promo: 399.9,
    stock: 14,
    image: vestidoSlide.url,
    gallery: [vestidoSlide.url, hero.url],
    description: "Slip dress no caimento certo: fluido, luminoso e irresistível. Camada única de elegância para a noite.",
    details: ["Decote em V", "Alças finas ajustáveis", "Comprimento midi", "Brilho acetinado discreto"],
    composition: compAcetinado,
    care: carePadrao,
    color: "Bordô profundo",
    sku: "RN-VS-007",
    sizes: S,
    isNew: true,
    status: "publicado",
  },
  {
    id: "8",
    slug: "macacao-frente-unica",
    name: "Macacão Frente Única",
    category: "Macacões",
    price: 529.9,
    stock: 7,
    image: macacaoSlide.url,
    gallery: [macacaoSlide.url, macacoes.url, conjuntos.url],
    description: "Macacão frente única com amarração lateral. Do fim de tarde ao after — uma peça que resolve o look inteiro.",
    details: ["Frente única assimétrica", "Amarração lateral", "Perna ampla", "Elástico confortável na cintura"],
    composition: compCrepe,
    care: carePadrao,
    color: "Marsala",
    sku: "RN-MC-008",
    sizes: S,
    isNew: true,
    status: "publicado",
  },
  {
    id: "9",
    slug: "blazer-alongado-bordo",
    name: "Blazer Alongado Bordô",
    category: "Blazers",
    price: 749.9,
    stock: 6,
    image: blazerSlide.url,
    gallery: [blazerSlide.url, blazers.url],
    description: "Silhueta alongada, ombros limpos e presença de grife. O blazer que vira casaco, capa e declaração.",
    details: ["Comprimento alongado", "Cós opcional com cinto fino", "Forro completo", "Botão único"],
    composition: compAlfaiataria,
    care: carePadrao,
    color: "Bordô",
    sku: "RN-BL-009",
    sizes: S,
    status: "publicado",
  },
  {
    id: "10",
    slug: "conjunto-saia-midi",
    name: "Conjunto Top e Saia Midi",
    category: "Conjuntos",
    price: 469.9,
    promo: 429.9,
    stock: 11,
    image: conjuntos.url,
    gallery: [conjuntos.url, vestidos.url, conjuntoSlide.url],
    description: "Top cropped estruturado com saia midi plissada. Feminilidade com atitude — para quem prefere chegar sem pedir licença.",
    details: ["Top com zíper invisível", "Saia midi com leve movimento", "Cintura marcada", "Conjunto coordenado"],
    composition: compCrepe,
    care: carePadrao,
    color: "Vinho",
    sku: "RN-CJ-010",
    sizes: S,
    status: "publicado",
  },
  {
    id: "11",
    slug: "vestido-tubinho-marsala",
    name: "Vestido Tubinho Marsala",
    category: "Vestidos",
    price: 519.9,
    stock: 10,
    image: vestidos.url,
    gallery: [vestidos.url, hero.url],
    description: "Tubinho clássico revisitado em marsala. Linha limpa, comprimento midi e a cor que já é identidade da marca.",
    details: ["Modelagem justa", "Decote redondo", "Zíper posterior", "Forro interno"],
    composition: compCrepe,
    care: carePadrao,
    color: "Marsala",
    sku: "RN-VS-011",
    sizes: S,
    best: true,
    status: "publicado",
  },
  {
    id: "12",
    slug: "macacao-pantacourt",
    name: "Macacão Pantacourt",
    category: "Macacões",
    price: 489.9,
    stock: 8,
    image: macacoes.url,
    gallery: [macacoes.url, macacaoSlide.url],
    description: "Macacão pantacourt com decote quadrado. Conforto elevado à categoria de look pronto.",
    details: ["Perna pantacourt", "Decote quadrado", "Alças médias", "Bolsos laterais discretos"],
    composition: compAlfaiataria,
    care: carePadrao,
    color: "Bordô",
    sku: "RN-MC-012",
    sizes: S,
    status: "publicado",
  },
  {
    id: "13",
    slug: "blazer-cropped-estruturado",
    name: "Blazer Cropped Estruturado",
    category: "Blazers",
    price: 589.9,
    promo: 529.9,
    stock: 9,
    image: blazers.url,
    gallery: [blazers.url, blazerSlide.url, conjuntoSlide.url],
    description: "Cropped com ombro marcado e cintura definida. Ideal sobre vestidos slip ou conjuntos de alfaiataria.",
    details: ["Comprimento cropped", "Ombros estruturados", "Dois bolsos com aba", "Forro acetinado"],
    composition: compAlfaiataria,
    care: carePadrao,
    color: "Vinho",
    sku: "RN-BL-013",
    sizes: S,
    isNew: true,
    status: "publicado",
  },
  {
    id: "14",
    slug: "vestido-assimetrico-noite",
    name: "Vestido Assimétrico Noite",
    category: "Vestidos",
    price: 679.9,
    stock: 4,
    image: hero.url,
    gallery: [hero.url, vestidoSlide.url, vestidos.url],
    description: "Barra assimétrica e brilho controlado. A peça de noite para quem prefere drama elegante, nunca exagero.",
    details: ["Barra assimétrica", "Um ombro só", "Tecido com leve brilho", "Forro integral"],
    composition: compAcetinado,
    care: carePadrao,
    color: "Bordô noite",
    sku: "RN-VS-014",
    sizes: S,
    best: true,
    status: "publicado",
  },
  {
    id: "15",
    slug: "conjunto-calca-wide-leg",
    name: "Conjunto Calça Wide Leg",
    category: "Conjuntos",
    price: 599.9,
    stock: 7,
    image: conjuntoSlide.url,
    gallery: [conjuntoSlide.url, conjuntos.url, blazerSlide.url],
    description: "Top de alça fina e calça wide leg fluidas. Proporção alongada, presença imediata.",
    details: ["Calça wide leg", "Top com alças finas", "Cós elástico forrado", "Caimento fluido"],
    composition: compCrepe,
    care: carePadrao,
    color: "Marsala",
    sku: "RN-CJ-015",
    sizes: S,
    status: "publicado",
  },
  {
    id: "16",
    slug: "macacao-envelope",
    name: "Macacão Envelope",
    category: "Macacões",
    price: 549.9,
    promo: 499.9,
    stock: 6,
    image: macacaoSlide.url,
    gallery: [macacaoSlide.url, macacoes.url],
    description: "Decote envelope e cintura amarrada. Feminino, versátil e pronto para a agenda cheia.",
    details: ["Decote envelope", "Faixa na cintura", "Perna reta", "Manga curta"],
    composition: compCrepe,
    care: carePadrao,
    color: "Vinho",
    sku: "RN-MC-016",
    sizes: S,
    status: "publicado",
  },
];

const defaultSubcategory: Record<string, string> = {
  "1": "Tomara que caia",
  "2": "Midi com capa",
  "3": "Alfaiataria",
  "4": "Oversized",
  "5": "Gola alta",
  "6": "Alfaiataria",
  "7": "Slip",
  "8": "Frente única",
  "9": "Alongado",
  "10": "Saia midi",
  "11": "Tubinho",
  "12": "Pantacourt",
  "13": "Cropped",
  "14": "Assimétrico",
  "15": "Wide leg",
  "16": "Envelope",
};

const seedProducts: Product[] = seedProductsRaw.map((p) => ({
  ...p,
  subcategory: p.subcategory ?? defaultSubcategory[p.id] ?? "",
  showInVitrine: p.showInVitrine ?? true,
  featured: p.featured ?? !!p.best,
}));

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const seedOrders: Order[] = [
  { id: "RN-1048", customer: "Fernanda Dias", email: "fer.dias@email.com", phone: "11987654321", total: 699.9, status: "Pago", date: daysAgo(0), items: 1, payment: "PIX", city: "São Paulo" },
  { id: "RN-1047", customer: "Larissa Mendes", email: "lari@email.com", phone: "21988776655", total: 1049.8, status: "Pago", date: daysAgo(1), items: 2, payment: "Cartão", city: "Rio de Janeiro" },
  { id: "RN-1046", customer: "Patrícia Souza", email: "pati@email.com", total: 419.9, status: "Enviado", date: daysAgo(1), items: 1, payment: "PIX", city: "Campinas" },
  { id: "RN-1045", customer: "Amanda Nunes", email: "amanda@email.com", total: 839.8, status: "Pago", date: daysAgo(2), items: 2, payment: "Cartão", city: "Belo Horizonte" },
  { id: "RN-1044", customer: "Renata Oliveira", email: "renata@email.com", total: 629.9, status: "Aguardando pagamento", date: daysAgo(2), items: 1, payment: "Boleto", city: "Curitiba" },
  { id: "RN-1043", customer: "Sofia Martins", email: "sofia@email.com", total: 479.9, status: "Pago", date: daysAgo(3), items: 1, payment: "PIX", city: "Porto Alegre" },
  { id: "RN-1042", customer: "Mariana Alves", email: "mariana@email.com", total: 909.8, status: "Pago", date: daysAgo(4), items: 2, payment: "Cartão", city: "São Paulo" },
  { id: "RN-1041", customer: "Juliana Costa", email: "ju.costa@email.com", total: 629.9, status: "Enviado", date: daysAgo(5), items: 1, payment: "PIX", city: "Brasília" },
  { id: "RN-1040", customer: "Camila Rocha", email: "camila.r@email.com", total: 479.9, status: "Aguardando pagamento", date: daysAgo(5), items: 1, payment: "Boleto", city: "Salvador" },
  { id: "RN-1039", customer: "Beatriz Lima", email: "bia@email.com", total: 1259.7, status: "Entregue", date: daysAgo(6), items: 3, payment: "Cartão", city: "Recife" },
  { id: "RN-1038", customer: "Gabriela Pinto", email: "gabi@email.com", total: 589.9, status: "Entregue", date: daysAgo(7), items: 1, payment: "PIX", city: "Fortaleza" },
  { id: "RN-1037", customer: "Helena Castro", email: "helena@email.com", total: 699.9, status: "Entregue", date: daysAgo(8), items: 1, payment: "Cartão", city: "Florianópolis" },
];

export const seedSettings: Settings = {
  promoText: "Primeira compra? Ganhe 10% OFF com o cupom BEMVINDA",
  promoActive: true,
  heroKicker: "REIS NOIR",
  heroTitle: "Uma roupa que chega no lugar, sem você precisar fazer",
  heroAccent: "escândalo.",
  heroButton: "Descubra a coleção",
  slides: [
    {
      kicker: "NOVA COLEÇÃO · VESTIDOS",
      title: "Entradas que viram",
      accent: "lembrança.",
      text: "Vestidos com capa fluida para noites que pedem presença.",
      button: "Ver vestidos",
    },
    {
      kicker: "CONJUNTOS",
      title: "Dois tempos, uma só",
      accent: "assinatura.",
      text: "Top estruturado e alfaiataria de cintura alta.",
      button: "Ver conjuntos",
    },
    {
      kicker: "ALFAIATARIA",
      title: "Poder também se",
      accent: "veste.",
      text: "Blazers oversized com corte impecável. Parcele em até 12x.",
      button: "Ver blazers",
    },
    {
      kicker: "MACACÕES · ATÉ 15% OFF",
      title: "A cidade acende,",
      accent: "você também.",
      text: "Macacões frente única para o fim de tarde ao after.",
      button: "Aproveitar",
    },
  ],
  benefits: [
    { title: "Compra segura", subtitle: "Seus dados protegidos" },
    { title: "Envio para todo o Brasil", subtitle: "Com rastreamento" },
    { title: "Parcele em até 12x", subtitle: "No cartão de crédito" },
    { title: "Atendimento especializado", subtitle: "Estamos aqui para você" },
  ],
  collectionsEyebrow: "NOSSAS COLEÇÕES",
  collectionsTitle: "Descubra o seu próximo favorito",
  productsTitle: "Novidades & Mais vendidos",
  editorialTitle: "Elegância é se sentir bem.",
  editorialKicker: "REIS NOIR",
  editorialButton: "Conheça a marca",
  footerAbout: "Moda feminina sofisticada, elegante e contemporânea.",
  footerWhatsappLabel: "(11) 99552-3083",
  footerWhatsappNumber: "5511995523083",
  footerInstagram: "reis_noir",
  footerPoliciesTitle: "Políticas",
  footerPolicy1: "Privacidade",
  footerPolicy2: "Trocas e devoluções",
  footerPolicy3: "Entrega",
  footerPaymentTitle: "Pagamento",
  footerPaymentText: "PIX · Cartão em até 12x · Boleto",
  footerCopyright: "© 2026 REIS NOIR. Todos os direitos reservados.",
};

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

/** v5: subcategorias + vitrine/destaques/novidades/mais vendidos. */
export type Coupon = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  active: boolean;
  minOrder: number;
  note?: string;
};

export type CommerceConfig = {
  storeName: string;
  storeUrlLabel: string;
  freeShippingFrom: number;
  flatShipping: number;
  supportEmail: string;
  lowStockThreshold: number;
  maintenanceMode: boolean;
  maintenanceMessage: string;
};

export const seedCoupons: Coupon[] = [
  {
    id: "c1",
    code: "BEMVINDA",
    type: "percent",
    value: 10,
    active: true,
    minOrder: 0,
    note: "Primeira compra",
  },
];

export const seedCommerce: CommerceConfig = {
  storeName: "REIS NOIR",
  storeUrlLabel: "reisnoir",
  freeShippingFrom: 500,
  flatShipping: 29.9,
  supportEmail: "contato@reisnoir.com.br",
  lowStockThreshold: 5,
  maintenanceMode: false,
  maintenanceMessage: "Estamos em manutenção rápida. Volte em instantes.",
};

export const useProducts = () => useLS("rn-products-v5", seedProducts);
export const useCatalog = () => useLS("rn-catalog-v1", seedCatalog);
export const useOrders = () => useLS("rn-orders-v3", seedOrders);
export const useSettings = () => useLS("rn-settings-v2", seedSettings);
export const useCart = () => useLS<CartItem[]>("rn-cart", []);
export const useCoupons = () => useLS("rn-coupons-v1", seedCoupons);
export const useCommerce = () => useLS("rn-commerce-v1", seedCommerce);

export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const ADMIN_PASSWORD = "1234";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    /* ignore */
  }
  return fallback;
}

/** Compatível com PDPs e sacola — lê a config persistida. */
export const FREE_SHIPPING_FROM = seedCommerce.freeShippingFrom;
export const COUPON_CODE = seedCoupons[0]?.code ?? "BEMVINDA";
export const COUPON_RATE = (seedCoupons[0]?.value ?? 10) / 100;

export function getFreeShippingFrom() {
  return readJson("rn-commerce-v1", seedCommerce).freeShippingFrom;
}

export function getFlatShipping() {
  return readJson("rn-commerce-v1", seedCommerce).flatShipping;
}

export function getActiveCoupons() {
  return readJson("rn-coupons-v1", seedCoupons).filter((c) => c.active);
}

export function findCoupon(code: string) {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;
  return getActiveCoupons().find((c) => c.code.toUpperCase() === normalized) ?? null;
}

export type CartLine = CartItem & { p: Product };

export function resolveCartLines(cart: CartItem[], products: Product[]): CartLine[] {
  return cart
    .map((c) => ({ ...c, p: products.find((p) => p.id === c.productId)! }))
    .filter((l) => l.p);
}

export function calcCartTotals(lines: CartLine[], coupon: string, shippingOverride?: number | null) {
  const subtotal = lines.reduce((a, l) => a + (l.p.promo ?? l.p.price) * l.qty, 0);
  const match = findCoupon(coupon);
  let discount = 0;
  if (match && subtotal >= (match.minOrder || 0)) {
    discount = match.type === "percent" ? subtotal * (match.value / 100) : Math.min(subtotal, match.value);
  }
  const freeFrom = getFreeShippingFrom();
  const flat = getFlatShipping();
  const shipping =
    shippingOverride != null
      ? Math.max(0, shippingOverride)
      : subtotal > 0 && subtotal - discount < freeFrom
        ? flat
        : 0;
  const total = Math.max(0, subtotal - discount + shipping);
  const items = lines.reduce((a, l) => a + l.qty, 0);
  return { subtotal, discount, shipping, total, items, appliedCoupon: match };
}

export function nextOrderId(orders: Order[]) {
  const nums = orders.map((o) => Number(o.id.replace(/\D/g, ""))).filter(Boolean);
  const n = nums.length ? Math.max(...nums) + 1 : 1100;
  return `RN-${n}`;
}

export function paidRevenue(orders: Order[]) {
  return orders.filter((o) => o.status !== "Aguardando pagamento").reduce((a, o) => a + o.total, 0);
}
