import { createServerFn } from "@tanstack/react-start";

type MpPaymentBody = Record<string, unknown>;

export const getMpPublicKey = createServerFn({ method: "GET" }).handler(async () => {
  return {
    publicKey: process.env.VITE_MP_PUBLIC_KEY || process.env.MP_PUBLIC_KEY || "",
    configured: Boolean(process.env.MP_ACCESS_TOKEN && (process.env.VITE_MP_PUBLIC_KEY || process.env.MP_PUBLIC_KEY)),
  };
});

export const processMercadoPagoPayment = createServerFn({ method: "POST" })
  .validator(
    (data: {
      formData: MpPaymentBody;
      order: {
        id: string;
        email: string;
        name: string;
        amount: number;
        description: string;
      };
    }) => data,
  )
  .handler(async ({ data }) => {
    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) {
      throw new Error("Mercado Pago não configurado. Defina MP_ACCESS_TOKEN nas secrets.");
    }

    const amount = Math.round(data.order.amount * 100) / 100;
    const payload = {
      ...data.formData,
      transaction_amount: amount,
      description: data.order.description,
      external_reference: data.order.id,
      payer: {
        ...((data.formData.payer as object) || {}),
        email: data.order.email,
      },
      metadata: {
        customer_name: data.order.name,
        order_id: data.order.id,
      },
    };

    const res = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `${data.order.id}-${Date.now()}`,
      },
      body: JSON.stringify(payload),
    });

    const json = (await res.json()) as {
      id?: number;
      status?: string;
      status_detail?: string;
      message?: string;
      cause?: Array<{ description?: string }>;
      point_of_interaction?: { transaction_data?: { qr_code?: string; ticket_url?: string } };
    };

    if (!res.ok) {
      const detail = json.cause?.[0]?.description || json.message || "Falha ao processar pagamento";
      console.error("MP payment error", json);
      throw new Error(detail);
    }

    return {
      id: String(json.id ?? ""),
      status: json.status ?? "pending",
      statusDetail: json.status_detail ?? "",
      qrCode: json.point_of_interaction?.transaction_data?.qr_code,
      ticketUrl: json.point_of_interaction?.transaction_data?.ticket_url,
    };
  });
