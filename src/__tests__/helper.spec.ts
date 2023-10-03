import { describe, test, expect } from 'vitest'
import { parsePrimitiveValue, qs } from '../helper'

describe('qs', () => {
  test('getQueryStringProps', () => {
    const { getQueryStringProps } = qs(['foo', 'bar'], 'queries')
    expect(
      getQueryStringProps({ params: { queries: ['foo-apple', 'bar-orange'] } })
    ).toEqual({ foo: 'apple', bar: 'orange' })
    expect(
      getQueryStringProps({ params: { queries: ['foo-apple', 'baz-orange'] } })
    ).toEqual({ foo: 'apple' })
    expect(getQueryStringProps({ params: { queries: ['foo-apple'] } })).toEqual(
      { foo: 'apple' }
    )
    expect(getQueryStringProps({ params: { queries: 'foo-apple' } })).toEqual({
      foo: 'apple'
    })
    expect(getQueryStringProps({})).toEqual({})
    expect(getQueryStringProps({ params: { queries: 'foo-2a' } })).toEqual({
      foo: '2a'
    })
  })
  test('makeQuery', () => {
    const { makeQuery } = qs(['foo', 'bar'] as const, 'queries')
    expect(makeQuery({ foo: 'apple', bar: 'orange' })).toEqual({
      queries: ['bar-orange', 'foo-apple']
    })
    expect(makeQuery({ foo: 'apple' })).toEqual({
      queries: ['foo-apple']
    })
    expect(makeQuery({ foo: 'apple', bar: undefined })).toEqual({
      queries: ['foo-apple']
    })
  })
  describe('getQueryStringProps with custom parse value', () => {
    const { getQueryStringProps } = qs(
      ['foo', 'bar'] as const,
      'queries',
      parsePrimitiveValue
    )
    test('parse Number', () => {
      expect(
        getQueryStringProps({
          params: { queries: ['foo-1', 'bar-2'] }
        })
      ).toEqual({ foo: 1, bar: 2 })
    })
    test('parse incorrect Number as string', () => {
      expect(
        getQueryStringProps({
          params: { queries: ['foo-1a', 'bar-2000'] }
        })
      ).toEqual({ foo: '1a', bar: 2_000 })
    })
    test('parse null', () => {
      expect(
        getQueryStringProps({
          params: { queries: ['foo-null'] }
        })
      ).toEqual({ foo: null})
    })
    test('parse bool', () => {
      expect(
        getQueryStringProps({
          params: { queries: ['foo-true', 'bar-false'] }
        })
      ).toEqual({ foo: true, bar: false})
    })
  })
})
