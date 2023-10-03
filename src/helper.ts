import { GetStaticPropsContext } from 'next/types'

// type QParamsValue = number | string | boolean | null
type QParamsResult<T> = Record<string, T>
type DefaultParserQParams<T> = (key: string, value: string) => T

const boolValues = ['true', 'false']
export function parsePrimitiveValue(_: string, value: string): number | string | boolean | null {
  if (value === 'null') return null
  if (boolValues.includes(value)) return value === 'true'
  const int = parseInt(value, 10)
  if (!Number.isNaN(int) && `${int}` === value) return int
  return value
}

/**
 * Create method for parse/hash query params from URL pathname
 *
 * @param {readonly string[]} keys - List valid query param names
 * @param {string} paramsKey - NextJS page name
 * @example
 * > /pages/store/[[...part]].tsx => 'part'
 * @param {DefaultParserQParams} parseValueFn - Callback function for parse params value
 * @default (key, val) => string
 *
 * @returns - Methods for parse/hash query params
 */
export const qs = <T> (
  keys: readonly string[],
  paramsKey: string,
  parseValueFn: DefaultParserQParams<T> = (k, v) => v as unknown as T,
) => {
  const reg = new RegExp(`^([${keys.join('|')}]+)-(.*)`)
  return {
    /**
     * Parse hashed url and return query params Object
     * @param {ParsedUrlQuery} param - context getStaticProps function
     * @returns - result parse query params
     */
    getQueryStringProps: ({ params }: GetStaticPropsContext): QParamsResult<T> => {
      const param = params?.[paramsKey] ?? []
      const paramList: string[] = Array.isArray(param) ? param : [param]

      // const existKeys: string[] = []
      const out = paramList.reduce((res, param2) => {
        // Parse hashed query param to key => value
        const parseResult = reg.exec(param2)
        if (!parseResult) return res
        const [_, key, value] = parseResult

        // Mark param as parsed
        // removeParamsFromPath && existKeys.push(param2)
        res[key] = parseValueFn(key, value)

        return res
      }, {} as QParamsResult<T>)

      // Remove parsed query params from URL params
      // if (removeParamsFromPath && !!params?.[paramsKey]) {
      //   params[paramsKey] = paramList.filter(
      //     (p: string) => !existKeys.includes(p)
      //   )
      // }
      return out
    },
    makeQuery: (params: Record<string, any>): Record<string, string[]> => {
      return {
        [paramsKey]: Object.entries(params)
          .filter(([k, v]) => v && keys.includes(k))
          .sort()
          .map(([k, v]) => `${k}-${v}`)
      }
    }
  }
}
