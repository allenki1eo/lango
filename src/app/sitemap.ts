import type { MetadataRoute } from "next";
import { catalog } from "@/lib/catalog";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/huduma", ...catalog.services.map((s) => `/huduma/${s.slug}`)];
  return paths.map((p) => ({
    url: `${base}/sw${p}`,
    lastModified: catalog.lastChecked,
    alternates: { languages: { sw: `${base}/sw${p}`, en: `${base}/en${p}` } },
  }));
}
