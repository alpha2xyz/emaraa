import { useEffect } from "react";

interface SeoOptions {
  title: string;
  description: string;
  path: string; // canonical path, e.g. "/about"
}

const SITE_URL = "https://emaraa.app";

// Sets document title, meta description, and canonical URL per public page.
// index.html carries no static canonical — every public page must call this
// hook, otherwise crawlers see all routes as one untagged page.
export function useSeo({ title, description, path }: SeoOptions) {
  useEffect(() => {
    document.title = title;

    let desc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!desc) {
      desc = document.createElement("meta");
      desc.setAttribute("name", "description");
      document.head.appendChild(desc);
    }
    desc.setAttribute("content", description);

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${SITE_URL}${path === "/" ? "/" : path}`);
  }, [title, description, path]);
}
