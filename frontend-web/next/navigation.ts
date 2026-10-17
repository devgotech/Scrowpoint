export function usePathname(): string {
  if (typeof window !== "undefined") {
    return window.location.pathname;
  }
  return "/";
}

export function useRouter() {
  return {
    push: (url: string) => {
      if (typeof window !== "undefined") {
        window.location.href = url;
      }
    },
    replace: (url: string) => {
      if (typeof window !== "undefined") {
        window.location.replace(url);
      }
    },
    refresh: () => {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    },
    back: () => {
      if (typeof window !== "undefined") {
        window.history.back();
      }
    },
  };
}

export function useSearchParams(): URLSearchParams {
  if (typeof window !== "undefined") {
    return new URLSearchParams(window.location.search);
  }
  return new URLSearchParams();
}
