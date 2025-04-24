import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

if (!process.env.NEXT_PUBLIC_APP_URL) {
	console.error("NEXT_PUBLIC_APP_URL environment variable is not set");
}

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
	router: ourFileRouter,
	config: {
		callbackUrl: process.env.NEXT_PUBLIC_APP_URL 
			? `${process.env.NEXT_PUBLIC_APP_URL}/api/uploadthing`
			: "/api/uploadthing", // Fallback to relative path if env var is not set
	},
});
