// Route handler context for Next.js 16
// In Next.js 16, params are always Promise-based.
// Use this interface for route handler context typing.

export interface RouteContext {
  params: Promise<Record<string, string>>;
}
