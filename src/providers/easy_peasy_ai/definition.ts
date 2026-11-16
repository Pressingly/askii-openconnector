import type { ProviderDefinition } from "../../core/types.ts";

import { easyPeasyAiActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "easy_peasy_ai",
  displayName: "Easy-Peasy.AI",
  homepageUrl: "https://easy-peasy.ai",
  iconUrl: "https://static.oomol.com/logo/third-party/easy_peasy_ai.png",
  categories: ["AI", "Marketing"],
  authTypes: ["api_key"],
  auth: [
    {
      type: "api_key",
      label: "API Key",
      description:
        "Create an Easy-Peasy.AI API key at https://easy-peasy.ai/settings/api. It authenticates requests through the x-api-key header.",
    },
  ],
  actions: easyPeasyAiActions,
};
