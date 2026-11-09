import { useEffect, useState } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import { processMercadoPagoPayment } from "@/integrations/mercado-pago";

type Props = {
  amount: number;
  publicKey: string;
  orderId: string;
  email: string;
  name: string;
  description: string;
  onPaid: (result: { id: string; status: string; statusDetail: string }) => void;
  onError: (message: string) => void;
};

export function MercadoPagoBrick({ amount, publicKey, orderId, email, name, description, onPaid, onError }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!publicKey) return;
    initMercadoPago(publicKey, { locale: "pt-BR" });
    setReady(true);
  }, [publicKey]);

  if (!publicKey) {
    return (
      <div className="border border-wine/20 bg-blush/50 p-4 text-sm text-wine">
        Configure <code className="text-xs">VITE_MP_PUBLIC_KEY</code> e <code className="text-xs">MP_ACCESS_TOKEN</code> nas secrets para ativar o checkout transparente.
      </div>
    );
  }

  if (!ready || amount <= 0) {
    return <p className="text-sm text-muted-foreground">Carregando pagamento seguro…</p>;
  }

  return (
    <div className="rn-mp-brick overflow-hidden border border-[#e8ddd4] bg-[#fbfaf8] p-3 md:p-4">
      <Payment
        initialization={{
          amount: Math.round(amount * 100) / 100,
          payer: { email },
        }}
        customization={{
          paymentMethods: {
            creditCard: "all",
            debitCard: "all",
            ticket: "all",
            bankTransfer: "all",
          },
          visual: {
            style: {
              theme: "default",
              customVariables: {
                textPrimaryColor: "#3d1418",
                textSecondaryColor: "#6b4f52",
                inputBackgroundColor: "#ffffff",
                formBackgroundColor: "#fbfaf8",
                baseColor: "#5c1f26",
                baseColorFirstVariant: "#3d1418",
                baseColorSecondVariant: "#d9c3a5",
                errorColor: "#9b1c1c",
                successColor: "#3f6b4a",
                outlinePrimaryColor: "#e8ddd4",
                outlineSecondaryColor: "#5c1f26",
                buttonTextColor: "#f7f1ea",
                fontSizeExtraSmall: "11px",
                fontSizeSmall: "12px",
                fontSizeMedium: "14px",
                fontSizeLarge: "16px",
                fontWeightNormal: "400",
                fontWeightSemiBold: "500",
                formInputsTextTransform: "none",
                inputVerticalPadding: "14px",
                inputHorizontalPadding: "12px",
                inputFocusedBorderWidth: "1px",
                borderRadiusSmall: "0px",
                borderRadiusMedium: "0px",
                borderRadiusLarge: "0px",
                borderRadiusFull: "0px",
              },
            },
          },
        }}
        onSubmit={async ({ formData }) => {
          try {
            const result = await processMercadoPagoPayment({
              data: {
                formData: formData as Record<string, unknown>,
                order: { id: orderId, email, name, amount, description },
              },
            });
            onPaid(result);
          } catch (e) {
            const msg = e instanceof Error ? e.message : "Não foi possível concluir o pagamento";
            onError(msg);
            throw e;
          }
        }}
        onError={(err) => {
          console.error(err);
          onError("Erro no formulário de pagamento. Verifique os dados.");
        }}
        onReady={() => undefined}
      />
    </div>
  );
}
