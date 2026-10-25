import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "sp_token";
const AUTH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;
const BACKEND_URL = (
  process.env.CORE_BACKEND_URL?.trim() || "http://localhost:8080"
).replace(/\/+$/, "");

type AuthResponseData = {
  token: string;
  user: Record<string, unknown>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getBackendError(payload: unknown): string | null {
  if (!isRecord(payload)) return null;
  const error = payload.error;
  return typeof error === "string" && error ? error : null;
}

function getAuthResponseData(payload: unknown): AuthResponseData | null {
  if (!isRecord(payload) || !isRecord(payload.data)) return null;

  const { token, user } = payload.data;
  if (
    typeof token !== "string" ||
    token.length === 0 ||
    !isRecord(user) ||
    typeof user.id !== "string"
  ) {
    return null;
  }

  return { token, user };
}

async function readBackendPayload(response: Response): Promise<unknown | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function fetchBackend(path: string, init: RequestInit): Promise<Response> {
  return fetch(`${BACKEND_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...init.headers,
    },
  });
}

export async function handleAuthRequest(
  request: Request,
  endpoint: "login" | "signup"
): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { data: null, error: "Invalid request payload." },
      { status: 400 }
    );
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetchBackend(`/api/auth/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      { data: null, error: "Unable to reach the authentication service." },
      { status: 502 }
    );
  }

  const payload = await readBackendPayload(backendResponse);
  if (!backendResponse.ok) {
    return NextResponse.json(
      {
        data: null,
        error:
          getBackendError(payload) ??
          "The authentication service could not complete your request.",
      },
      { status: backendResponse.status }
    );
  }

  const authData = getAuthResponseData(payload);
  if (!authData) {
    return NextResponse.json(
      {
        data: null,
        error: "The authentication service returned an invalid response.",
      },
      { status: 502 }
    );
  }

  const response = NextResponse.json({
    data: authData.user,
    error: null,
  });
  response.cookies.set(AUTH_COOKIE_NAME, authData.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
  });
  return response;
}

export async function handleCurrentUserRequest(): Promise<NextResponse> {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json(
      { data: null, error: "Not authenticated." },
      { status: 401 }
    );
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetchBackend("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    return NextResponse.json(
      { data: null, error: "Unable to reach the authentication service." },
      { status: 502 }
    );
  }

  const payload = await readBackendPayload(backendResponse);
  if (!backendResponse.ok) {
    const response = NextResponse.json(
      {
        data: null,
        error:
          getBackendError(payload) ??
          "The authentication service could not load your account.",
      },
      { status: backendResponse.status }
    );
    if (backendResponse.status === 401 || backendResponse.status === 403) {
      response.cookies.delete(AUTH_COOKIE_NAME);
    }
    return response;
  }

  if (!isRecord(payload) || !isRecord(payload.data)) {
    return NextResponse.json(
      {
        data: null,
        error: "The authentication service returned an invalid response.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ data: payload.data, error: null });
}

export async function handleLogoutRequest(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  let response: NextResponse;

  if (!token) {
    response = NextResponse.json({ data: null, error: null });
  } else {
    try {
      const backendResponse = await fetchBackend("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await readBackendPayload(backendResponse);
      const backendData =
        isRecord(payload) && "data" in payload ? payload.data : null;
      response = NextResponse.json(
        {
          data: backendResponse.ok ? backendData : null,
          error: backendResponse.ok
            ? null
            : getBackendError(payload) ??
              "The authentication service could not end your session.",
        },
        { status: backendResponse.ok ? 200 : backendResponse.status }
      );
    } catch {
      response = NextResponse.json(
        {
          data: null,
          error: "Unable to reach the authentication service.",
        },
        { status: 502 }
      );
    }
  }

  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
