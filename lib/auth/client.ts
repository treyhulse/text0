import { useUser } from "@clerk/nextjs";

export function useSecureUser() {
  const { user } = useUser();
  return user;
}
