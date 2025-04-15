import { auth, currentUser } from "@clerk/nextjs/server";

const DEFAULT_USER_ID = "user_2vfLrF7SIkim0eRgCHpngMm8gP8";

export async function getSecureUser() {
  const user = await currentUser();
  if (!user) {
    return {
      id: DEFAULT_USER_ID,
      fullName: "Cool Visitor",
    };
  }
  return user;
}

export async function getSecureSession() {
  const session = await auth();
  if (!session.userId) {
    return {
      userId: DEFAULT_USER_ID,
    };
  }
  return session;
}
