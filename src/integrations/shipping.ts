import { createServerFn } from "@tanstack/react-start";
import {
  STORE_MELHOR_ENVIO_CLIENT_ID,
  STORE_MELHOR_ENVIO_CLIENT_SECRET,
  STORE_MELHOR_ENVIO_FROM_CEP,
} from "@/integrations/store-credentials";

export type ShippingQuote = {
  id: string;
  name: string;
  company: string;
  price: number;
  days: string;
  currency: "BRL";
  source: "melhor-envio" | "estimate";
};

function onlyDigits(v: string) {
  return v.replace(/\D/g, "");
}

function meBase() {
  const sandbox = process.env.MELHOR_ENVIO_SANDBOX === "true";
  return sandbox ? "https://sandbox.melhorenvio.com.br" : "https://melhorenvio.com.br";
}

function estimateByCep(cep: string, value: number): ShippingQuote[] {
  const n = Number(onlyDigits(cep).slice(0, 2) || "0");
  const far = n >= 60 || n <= 9;
  const mid = n >= 40 && n < 60;
  const pac = far ? 39.9 : mid ? 29.9 : 19.9;
  const sedex = far ? 59.9 : mid ? 44.9 : 32.9;
  const free = value >= 500;
  return [
    {
      id: "estimate-pac",
      name: "PAC",
      company: "Correios",
      price: free ? 0 : pac,
      days: far ? "8 a 14 dias úteis" : "5 a 10 dias úteis",
      currency: "BRL",
      source: "estimate",
    },
    {
      id: "estimate-sedex",
      name: "SEDEX",
      company: "Correios",
      price: free ? Math.max(0, sedex - 15) : sedex,
      days: far ? "3 a 6 dias úteis" : "1 a 3 dias úteis",
      currency: "BRL",
      source: "estimate",
    },
    {
      id: "estimate-jadlog",
      name: ".Package",
      company: "Jadlog",
      price: free ? 0 : pac + 4,
      days: far ? "6 a 12 dias úteis" : "4 a 8 dias úteis",
      currency: "BRL",
      source: "estimate",
    },
  ];
}

async function quoteMelhorEnvio(cep: string, value: number, qty: number): Promise<ShippingQuote[] | null> {
  const token = process.env.MELHOR_ENVIO_TOKEN?.trim();
  if (!token) return null;

  const from = onlyDigits(process.env.MELHOR_ENVIO_FROM_CEP || STORE_MELHOR_ENVIO_FROM_CEP);
  const to = onlyDigits(cep);
  if (to.length !== 8) throw new Error("CEP inválido");

  const res = await fetch(`${meBase()}/api/v2/me/shipment/calculate`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "REIS NOIR Checkout (contato.reisnoir@gmail.com)",
    },
    body: JSON.stringify({
      from: { postal_code: from },
      to: { postal_code: to },
      products: [
        {
          id: "rn-bag",
          width: 20,
          height: 10,
          length: 30,
          weight: Math.max(0.3, qty * 0.35),
          insurance_value: value,
          quantity: 1,
        },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Melhor Envio quote failed", res.status, text);
    return null;
  }

  const data = (await res.json()) as Array<{
    id: number | string;
    name: string;
    company?: { name?: string };
    price?: string | number;
    custom_price?: string | number;
    delivery_time?: number;
    custom_delivery_time?: number;
    error?: string;
  }>;

  return data
    .filter((o) => !o.error && (o.price != null || o.custom_price != null))
    .map((o) => {
      const price = Number(o.custom_price ?? o.price ?? 0);
      const days = o.custom_delivery_time ?? o.delivery_time ?? 7;
      return {
        id: String(o.id),
        name: o.name,
        company: o.company?.name ?? "Transportadora",
        price,
        days: `${days} dia${days === 1 ? "" : "s"} úteis`,
        currency: "BRL" as const,
        source: "melhor-envio" as const,
      };
    })
    .sort((a, b) => a.price - b.price)
    .slice(0, 6);
}

export const quoteShipping = createServerFn({ method: "POST" })
  .validator((data: { cep: string; value: number; qty: number }) => data)
  .handler(async ({ data }) => {
    const cep = onlyDigits(data.cep);
    if (cep.length !== 8) throw new Error("Informe um CEP válido com 8 dígitos");

    const me = await quoteMelhorEnvio(cep, data.value, data.qty);
    if (me && me.length > 0) {
      return { quotes: me, provider: "melhor-envio" as const };
    }
    return { quotes: estimateByCep(cep, data.value), provider: "estimate" as const };
  });
