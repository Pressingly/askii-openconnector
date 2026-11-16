import type { ProviderDefinition } from "../../core/types.ts";

import { cloudflareDocsActions } from "./actions.ts";

const service = "cloudflare_docs";

export const provider: ProviderDefinition = {
  service,
  displayName: "Cloudflare Docs",
  categories: ["Developer Tools", "AI"],
  authTypes: ["custom_credential"],
  auth: [{ type: "custom_credential", fields: [] }],
  homepageUrl: "https://developers.cloudflare.com",
  iconUrl: "https://static.oomol.com/logo/third-party/cloudflare_docs.svg",
  actions: cloudflareDocsActions,
};
