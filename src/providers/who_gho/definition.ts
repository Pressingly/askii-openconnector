import type { ProviderDefinition } from "../../core/types.ts";

import { whoGhoActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "who_gho",
  displayName: "WHO Global Health Observatory",
  categories: ["Data"],
  authTypes: ["no_auth"],
  auth: [{ type: "no_auth" }],
  homepageUrl: "https://www.who.int/data/gho",
  iconUrl: "https://static.oomol.com/logo/third-party/who_gho.svg",
  actions: whoGhoActions,
};
