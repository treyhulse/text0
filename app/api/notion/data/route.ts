import { NextResponse } from "next/server";
import { createClerkClient, type OauthAccessToken } from "@clerk/backend";
import { ClerkAPIResponseError } from "@clerk/shared";
import { getSecureSession } from "@/lib/auth/server";

export async function GET() {
  try {
    const session = await getSecureSession();
    if (!session.userId) {
      return NextResponse.json(
        { error: "Unauthorized: No user ID found" },
        { status: 401 }
      );
    }

    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    let oauthTokens: OauthAccessToken[] | undefined;
    try {
      const oauthTokensResponse =
        await clerkClient.users.getUserOauthAccessToken(
          session.userId,
          "notion"
        );
      oauthTokens = oauthTokensResponse.data;
    } catch (error) {
      if (error instanceof ClerkAPIResponseError) {
        return NextResponse.json(
          {
            error: "Failed to retrieve Notion OAuth token",
            details: error.errors,
          },
          { status: 400 }
        );
      }
      throw error;
    }

    if (!oauthTokens || oauthTokens.length === 0) {
      return NextResponse.json(
        { error: "Notion OAuth token not found for this user" },
        { status: 400 }
      );
    }

    const token = oauthTokens[0].token;

    // Fetch user data from Notion
    const userResponse = await fetch("https://api.notion.com/v1/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": "2022-06-28",
      },
    });
    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      return NextResponse.json(
        {
          error: "Failed to fetch user data from Notion",
          details: errorData,
          status: userResponse.status,
        },
        { status: userResponse.status }
      );
    }
    const userData = await userResponse.json();

    // Fetch user's pages (search for accessible pages)
    const pagesResponse = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        filter: { property: "object", value: "page" },
        sort: { direction: "descending", timestamp: "last_edited_time" },
        page_size: 10,
      }),
    });
    if (!pagesResponse.ok) {
      const errorData = await pagesResponse.json();
      return NextResponse.json(
        {
          error: "Failed to fetch pages from Notion",
          details: errorData,
          status: pagesResponse.status,
        },
        { status: pagesResponse.status }
      );
    }
    const pagesData = await pagesResponse.json();

    // Fetch user's databases (search for accessible databases)
    const databasesResponse = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        filter: { property: "object", value: "database" },
        sort: { direction: "descending", timestamp: "last_edited_time" },
        page_size: 10,
      }),
    });
    if (!databasesResponse.ok) {
      const errorData = await databasesResponse.json();
      return NextResponse.json(
        {
          error: "Failed to fetch databases from Notion",
          details: errorData,
          status: databasesResponse.status,
        },
        { status: databasesResponse.status }
      );
    }
    const databasesData = await databasesResponse.json();

    return NextResponse.json({
      user: userData,
      pages: pagesData.results,
      databases: databasesData.results,
    });
  } catch (error) {
    console.error("Error in Notion API route:", error);
    if (error instanceof ClerkAPIResponseError) {
      return NextResponse.json(
        {
          error: "Clerk API error",
          details: error.errors,
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
