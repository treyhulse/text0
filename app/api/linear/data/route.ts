import { getSecureSession } from "@/lib/auth/server";
import { type OauthAccessToken, createClerkClient } from "@clerk/backend";
import { ClerkAPIResponseError } from "@clerk/shared";
import { LinearClient } from "@linear/sdk";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSecureSession();
    if (!session.userId) {
      return NextResponse.json(
        { error: "Unauthorized: No user ID found" },
        { status: 401 },
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
          "linear",
        );
      oauthTokens = oauthTokensResponse.data;
    } catch (error) {
      if (error instanceof ClerkAPIResponseError) {
        return NextResponse.json(
          {
            error: "Failed to retrieve Linear OAuth token",
            details: error.errors,
          },
          { status: 400 },
        );
      }
      throw error;
    }

    if (!oauthTokens || oauthTokens.length === 0) {
      return NextResponse.json(
        { error: "Linear OAuth token not found for this user" },
        { status: 400 },
      );
    }

    const token = oauthTokens[0].token;

    // Initialize Linear Client with the access token
    const linearClient = new LinearClient({
      accessToken: token,
    });

    // Fetch the current user (viewer)
    const user = await linearClient.viewer;
    if (!user) {
      return NextResponse.json(
        { error: "Failed to fetch user data from Linear" },
        { status: 400 },
      );
    }

    // Fetch the user's assigned issues
    const assignedIssues = await user.assignedIssues();
    const issues = assignedIssues.nodes.map((issue) => ({
      id: issue.id,
      title: issue.title,
      description: issue.description ?? "No description",
      url: issue.url,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
    }));

    // Fetch the user's teams
    const teams = await linearClient.teams();
    const teamData = teams.nodes.map((team) => ({
      id: team.id,
      name: team.name,
      description: team.description ?? "No description",
      createdAt: team.createdAt,
    }));

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        displayName: user.displayName,
      },
      issues,
      teams: teamData,
    });
  } catch (error) {
    console.error("Error in Linear API route:", error);
    if (error instanceof ClerkAPIResponseError) {
      return NextResponse.json(
        {
          error: "Clerk API error",
          details: error.errors,
        },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 },
    );
  }
}
