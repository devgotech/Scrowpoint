export class NextResponse extends Response {
  static redirect(url: string | URL, status = 307) {
    return new Response(null, {
      status,
      headers: {
        Location: typeof url === "string" ? url : url.toString(),
      },
    });
  }

  static next() {
    return new Response(null, { status: 200 });
  }

  static json(body: any, init?: ResponseInit) {
    return new Response(JSON.stringify(body), {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  }
}

export interface NextRequest extends Request {
  nextUrl: URL;
  cookies: {
    get: (name: string) => { name: string; value: string } | undefined;
    getAll: () => { name: string; value: string }[];
  };
}
