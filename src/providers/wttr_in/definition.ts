import type { ProviderDefinition } from "../../core/types.ts";

import { wttrInActions } from "./actions.ts";

export const provider: ProviderDefinition = {
  service: "wttr_in",
  displayName: "wttr.in",
  categories: ["Location", "Data"],
  authTypes: ["no_auth"],
  auth: [{ type: "no_auth" }],
  homepageUrl: "https://wttr.in/",
  iconUrl: "https://static.oomol.com/logo/third-party/wttr_in.png",
  actions: wttrInActions,
};
