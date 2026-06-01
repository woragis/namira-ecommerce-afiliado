export class RedirectError extends Error {
  constructor(public url: string) {
    super(`REDIRECT:${url}`);
    this.name = "RedirectError";
  }
}

export function isRedirectError(e: unknown): e is RedirectError {
  return e instanceof RedirectError;
}
