import { handleCurrentUserRequest } from "@/lib/auth-api";

export async function GET() {
  return handleCurrentUserRequest();
}
