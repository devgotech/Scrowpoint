import { handleAuthRequest } from "@/lib/auth-api";

export async function POST(request: Request) {
  return handleAuthRequest(request, "login");
}
