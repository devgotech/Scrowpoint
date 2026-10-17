import { handleLogoutRequest } from "@/lib/auth-api";

export async function POST() {
  return handleLogoutRequest();
}
