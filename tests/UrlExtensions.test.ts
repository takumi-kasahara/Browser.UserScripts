import { describe, expect, it } from 'vitest';
import { getHttpUrl } from '../src/modules/UrlExtensions.js';

describe('getHttpUrl', () => {
  const baseUrl = 'https://example.net/redirect?=';

  it.each([
    ['https://example.com/path', 'https://example.com/path'],
    ['http://example.com/path', 'http://example.com/path'],
    ['/path', 'https://example.net/path'],
  ])('resolves web URL %s', (candidate, expected) => {
    expect(getHttpUrl(candidate, baseUrl)).toBe(expected);
  });

  it.each(['javascript:alert(1)', 'data:text/html,<script>alert(1)</script>'])(
    'rejects non-web URL %s',
    candidate => {
      expect(getHttpUrl(candidate, baseUrl)).toBeNull();
    },
  );
});
