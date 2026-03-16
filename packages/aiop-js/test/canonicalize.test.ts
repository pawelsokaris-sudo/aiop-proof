import { describe, it, expect } from 'vitest';
import { canonicalize } from '../src/canonicalize.js';

describe('canonicalize', () => {
  it('sorts object keys lexicographically', () => {
    expect(canonicalize({ b: 1, a: 2 })).toBe('{"a":2,"b":1}');
  });

  it('sorts nested object keys', () => {
    expect(canonicalize({ z: { b: 1, a: 2 }, a: 0 }))
      .toBe('{"a":0,"z":{"a":2,"b":1}}');
  });

  it('normalizes trailing zeros in numbers', () => {
    expect(canonicalize({ val: 1.10 })).toBe('{"val":1.1}');
  });

  it('keeps integers as integers', () => {
    expect(canonicalize({ count: 42 })).toBe('{"count":42}');
  });

  it('preserves array order', () => {
    expect(canonicalize({ arr: [3, 1, 2] })).toBe('{"arr":[3,1,2]}');
  });

  it('handles boolean and null', () => {
    expect(canonicalize({ empty: null, ok: true, fail: false }))
      .toBe('{"empty":null,"fail":false,"ok":true}');
  });

  it('escapes special characters in strings', () => {
    expect(canonicalize({ msg: 'hello "world"', path: 'a\\b' }))
      .toBe('{"msg":"hello \\"world\\"","path":"a\\\\b"}');
  });

  it('handles empty object', () => {
    expect(canonicalize({})).toBe('{}');
  });

  it('handles empty array', () => {
    expect(canonicalize({ items: [] })).toBe('{"items":[]}');
  });

  it('handles deeply nested objects', () => {
    expect(canonicalize({ a: { b: { c: { d: 1 } } } }))
      .toBe('{"a":{"b":{"c":{"d":1}}}}');
  });

  it('handles mixed array types', () => {
    expect(canonicalize({ data: [1, 'two', null, true, { z: 1, a: 2 }] }))
      .toBe('{"data":[1,"two",null,true,{"a":2,"z":1}]}');
  });

  it('handles null value', () => {
    expect(canonicalize(null)).toBe('null');
  });

  it('handles undefined as null', () => {
    expect(canonicalize(undefined)).toBe('null');
  });

  it('handles string with control characters', () => {
    expect(canonicalize({ s: 'line1\nline2\ttab' }))
      .toBe('{"s":"line1\\nline2\\ttab"}');
  });
});
