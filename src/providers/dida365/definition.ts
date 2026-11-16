import type { ProviderDefinition } from "../../core/types.ts";

import { dida365Actions, dida365OAuthScopes } from "./actions.ts";

const service = "dida365";

export const provider: ProviderDefinition = {
  service,
  displayName: "Dida365",
  categories: ["Productivity"],
  authTypes: ["oauth2"],
  auth: [
    {
      type: "oauth2",
      authorizationUrl: "https://dida365.com/oauth/authorize",
      tokenUrl: "https://dida365.com/oauth/token",
      scopes: [dida365OAuthScopes.read, dida365OAuthScopes.write],
      tokenEndpointAuthMethod: "client_secret_basic",
    },
  ],
  homepageUrl: "https://dida365.com",
  iconUrl: "https://static.oomol.com/logo/third-party/dida365.svg",
  actions: dida365Actions,
};
