import type { MetadataRoute } from "next";
import { config } from "@/data/config";

// Required for `output: 'export'` — metadata routes must be explicitly
// marked static since there's no server to render them on demand.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: config.site, changeFrequency: "monthly", priority: 1 }, { url: `${config.site}/resume`, changeFrequency: "monthly", priority: 0.8 }];
}
