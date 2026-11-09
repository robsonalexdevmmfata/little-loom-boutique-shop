import { useEffect } from "react";
import { useSeo } from "@/lib/cms-extras";

/** Aplica title/description do painel SEO na home (client). */
export function SeoHead({ scope = "home" }: { scope?: "home" }) {
  const [seo] = useSeo();

  useEffect(() => {
    if (scope !== "home" || typeof document === "undefined") return;
    if (seo.homeTitle) document.title = seo.homeTitle;
    const desc = document.querySelector('meta[name="description"]');
    if (desc && seo.homeDescription) desc.setAttribute("content", seo.homeDescription);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && seo.homeTitle) ogTitle.setAttribute("content", seo.homeTitle);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && seo.homeDescription) ogDesc.setAttribute("content", seo.homeDescription);
    const ogImg = document.querySelector('meta[property="og:image"]');
    if (ogImg && seo.defaultOgImage) ogImg.setAttribute("content", seo.defaultOgImage);
  }, [seo, scope]);

  return null;
}
