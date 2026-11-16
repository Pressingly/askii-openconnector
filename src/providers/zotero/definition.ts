import type { ProviderDefinition } from "../../core/types.ts";

import { zoteroActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "zotero",
  displayName: "Zotero",
  categories: ["Productivity", "Data"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      placeholder: "ZOTERO_API_KEY",
      description:
        "Zotero API key. Create a dedicated key and copy your user ID from https://www.zotero.org/settings/keys.",
    },
  ],
  homepageUrl: "https://www.zotero.org",
  iconUrl: "https://static.oomol.com/logo/third-party/zotero.png",
  actions: zoteroActions,
};
