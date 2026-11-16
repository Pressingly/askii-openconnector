import type { ProviderDefinition } from "../../core/types.ts";

import { clinicalTrialsGovActions } from "./actions.ts";
export const provider: ProviderDefinition = {
  service: "clinicaltrials_gov",
  displayName: "ClinicalTrials.gov",
  categories: ["Data"],
  authTypes: ["no_auth"],
  auth: [{ type: "no_auth" }],
  homepageUrl: "https://clinicaltrials.gov/",
  iconUrl: "https://static.oomol.com/logo/third-party/clinicaltrials_gov.svg",
  actions: clinicalTrialsGovActions,
};
