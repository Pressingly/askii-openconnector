import type { ProviderDefinition } from "../../core/types.ts";

import { docsend2PdfActions } from "./actions.ts";

const service = "docsend_2_pdf";

export const provider: ProviderDefinition = {
  service,
  displayName: "Docsend2pdf",
  categories: ["Productivity", "Design & Media"],
  authTypes: ["no_auth"],
  auth: [{ type: "no_auth" }],
  homepageUrl: "https://docsend2pdf.com",
  iconUrl: "https://static.oomol.com/logo/third-party/docsend_2_pdf.png",
  actions: docsend2PdfActions,
};
