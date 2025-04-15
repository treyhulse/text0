import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
	router: ourFileRouter,
	config: {
		callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/uploadthing`,
	},
});
