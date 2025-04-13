import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";

export const maxDuration = 90;
export const dynamic = "force-dynamic";

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,

  // Apply an (optional) custom config:
  // config: { ... },
});
