import { describe, expect, it, vi } from 'vitest';
import { extractObjects, tryParse } from '../src/modules/JsonExtensions.js';

describe('tryParse', () => {
  it('parses valid JSON', () => {
    expect(tryParse('{"a":1}')).toEqual({ a: 1 });
  });

  it('parses JSON wrapped in CDATA comments', () => {
    const input = '/*<![CDATA[*/ {"a":1} /*]]>*/';
    expect(tryParse(input)).toEqual({ a: 1 });
  });

  it('parses JSON with embedded newlines', () => {
    const input = '{\n  "a": 1,\n  "b": 2\n}';
    expect(tryParse(input)).toEqual({ a: 1, b: 2 });
  });

  it('returns null and warns on invalid JSON', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(tryParse('not json')).toBeNull();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('returns null for empty string', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(tryParse('')).toBeNull();
    warn.mockRestore();
  });

  it('rethrows non-Error values thrown by JSON.parse', () => {
    const original = JSON.parse;
    JSON.parse = (() => {
      throw 'boom';
    }) as typeof JSON.parse;
    expect(() => tryParse('{}')).toThrow('boom');
    JSON.parse = original;
  });
});

describe('extractObjects', () => {
  it('returns an empty array for null', () => {
    expect(extractObjects(null)).toEqual([]);
  });

  it('returns an empty array for a primitive', () => {
    // @ts-expect-error - testing runtime guard
    expect(extractObjects(42)).toEqual([]);
  });

  it('returns the object itself for a single object', () => {
    const obj = { a: 1 };
    expect(extractObjects(obj)).toEqual([obj]);
  });

  it('flattens nested objects', () => {
    const child = { b: 2 };
    const parent = { a: 1, child };
    expect(extractObjects(parent)).toEqual([parent, child]);
  });

  it('flattens arrays recursively', () => {
    const a = { a: 1 };
    const b = { b: 2 };
    expect(
      extractObjects([a, [b]] as unknown as Record<string, unknown>[]),
    ).toEqual([a, b]);
  });

  it('deduplicates identical references', () => {
    const shared = { x: 1 };
    const parent = { a: shared, b: shared };
    expect(extractObjects(parent)).toEqual([parent, shared]);
  });
});
