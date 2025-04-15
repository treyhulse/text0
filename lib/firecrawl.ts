import FirecrawlApp from "@mendable/firecrawl-js";

export const Firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY,
});
