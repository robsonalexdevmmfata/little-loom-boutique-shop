import { useEffect } from "react";
import { useMetaAds } from "@/lib/meta-ads";

/** Injeta o Pixel da Meta quando ativado no painel. */
export function MetaPixel() {
  const [meta] = useMetaAds();
  const pixelId = meta.pixelId.trim();
  const on = meta.enabled && Boolean(pixelId);

  useEffect(() => {
    if (!on || typeof window === "undefined") return;

    const w = window as Window & { fbq?: (...args: unknown[]) => void; _fbq?: unknown };
    if (!w.fbq) {
      const fbq = function (...args: unknown[]) {
        const fn = fbq as typeof fbq & {
          callMethod?: (...a: unknown[]) => void;
          queue: unknown[];
          push: typeof fbq;
          loaded: boolean;
          version: string;
        };
        if (fn.callMethod) fn.callMethod(...args);
        else fn.queue.push(args);
      } as ((...args: unknown[]) => void) & {
        callMethod?: (...a: unknown[]) => void;
        queue: unknown[];
        push: unknown;
        loaded: boolean;
        version: string;
      };
      fbq.queue = [];
      fbq.loaded = true;
      fbq.version = "2.0";
      fbq.push = fbq;
      w.fbq = fbq;
      w._fbq = fbq;

      const script = document.createElement("script");
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.appendChild(script);
    }

    w.fbq?.("init", pixelId);
    w.fbq?.("track", "PageView");
  }, [on, pixelId]);

  if (!on) return null;

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${encodeURIComponent(pixelId)}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
}
