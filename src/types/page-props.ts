// Type helpers for Next.js 16 async params/searchParams
// Usage: PageProps<'/planet/[id]'>

import type { ReadonlyURLSearchParams } from 'next/navigation';

type RouteParams<Route extends string> = 
  Route extends `${string}[${infer Param}]${infer Rest}`
    ? { [K in Param]: string } & RouteParams<Rest>
    : Record<string, never>;

export interface PageProps<Route extends string = never> {
  params: Promise<RouteParams<Route>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}
