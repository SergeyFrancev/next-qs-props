import { NextRequest, NextResponse, NextMiddleware } from 'next/server'

// interface MakeMiddlewareOptions 

const RESOLVE_ALL = (r: NextRequest) => true;
export interface QSMiddlewareOptions {
  /**
   * List parameters for provide to getStaticProps
   */
  params: string[]
  /**
   * Method for check apply middleware, if empty then middleware run always
   * @param {NextRequest} req - NextJS Request
   * @returns {boolean} - Need apply middleware for this request @default [true]
   */
  activeWhen?: (req: NextRequest) => boolean
}
/**
 * Inject query params in URL pathname as "QueryParamKey-QueryParamValue"
 *
 * @example
 * > 'pathname?foo=1&boo=true' => 'pathname/foo-1/boo-true'
 *
 * @param {QSMiddlewareOptions} option
 * @returns - Returns new pathname URL with injected query params
 */
export const makeMiddleware = (option: {
  activeWhen?: (request: NextRequest) => boolean,
  keys: string[]
}): NextMiddleware => {
  return (req: NextRequest) => {
    // Check need apply
    if (!(option.activeWhen ?? RESOLVE_ALL)(req)) return

    // Build path by params from query
    const params = option.keys
      .reduce<string[]>((res, key) => {
        const val = req.nextUrl.searchParams.get(key)
        if (val) res.push(`${key}-${val}`)
        return res
      }, [])
      .sort()
      .join('/')

    // If query not contains allowed params, then skip replace URL
    if (!params) return

    // Inject query params to URL
    const url = req.nextUrl.clone()
    url.pathname = (url.pathname + `/${params}`).replace(/\/\//, '/')

    return NextResponse.rewrite(url)
  }
}
