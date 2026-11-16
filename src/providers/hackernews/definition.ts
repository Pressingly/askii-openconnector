import type { ProviderDefinition } from "../../core/types.ts";

import { hackernewsActions } from "./actions.ts";

const service = "hackernews";

/**
 * Hacker News provider backed by the public Firebase and Algolia APIs.
 */
export const provider: ProviderDefinition = {
  service,
  displayName: "Hacker News",
  categories: ["Social"],
  authTypes: ["no_auth"],
  auth: [{ type: "no_auth" }],
  homepageUrl: "https://news.ycombinator.com",
  iconUrl: "https://static.oomol.com/logo/third-party/Hacker%20News.svg",
  actions: hackernewsActions,
};
