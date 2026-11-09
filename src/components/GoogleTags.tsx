import { useEffect } from "react";
import { useAnalytics } from "@/lib/cms-extras";

/** Injeta Google Analytics 4 e/ou Google Tag Manager quando ativos no painel. */
export function GoogleTags() {
  const [cfg] = useAnalytics();
  const ga = cfg.gaId.trim();
  const gtm = cfg.gtmId.trim();
  const on = cfg.enabled && (Boolean(ga) || Boolean(gtm));

  useEffect(() => {
    if (!on || typeof document === "undefined") return;

    if (gtm && !document.getElementById("rn-gtm")) {
      const s = document.createElement("script");
      s.id = "rn-gtm";
      s.async = true;
      s.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm.replace(/'/g, "")}');`;
      document.head.appendChild(s);
    }

    if (ga && !document.getElementById("rn-ga")) {
      const lib = document.createElement("script");
      lib.id = "rn-ga";
      lib.async = true;
      lib.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga)}`;
      document.head.appendChild(lib);
      const inline = document.createElement("script");
      inline.id = "rn-ga-inline";
      inline.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga.replace(/'/g, "")}');`;
      document.head.appendChild(inline);
    }
  }, [on, ga, gtm]);

  if (!on || !gtm) return null;

  return (
    <noscript>
      <iframe
        title="gtm"
        src={`https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(gtm)}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}
