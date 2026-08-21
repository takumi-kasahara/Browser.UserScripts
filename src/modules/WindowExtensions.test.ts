import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  equiv,
  exists,
  from,
  is,
  open,
  select,
  tryFetch,
} from './WindowExtensions.js';

/** Build a Response-like object with a url property (jsdom Response lacks url). */
function mockResponse(status: number, url: string): Response {
  const response = new Response(null, { status });
  Object.defineProperty(response, 'url', { value: url });
  return response;
}

describe('select', () => {
  it('returns null when there is no selection', () => {
    expect(select()).toBeNull();
  });

  it('returns null when the selection has no ranges', () => {
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    expect(selection.rangeCount).toBe(0);
    expect(select()).toBeNull();
  });

  it('expands the range to the ancestor element', () => {
    document.body.innerHTML
      = '<div id="root"><span id="child">text</span></div>';
    const child = document.getElementById('child')!;
    const range = document.createRange();
    range.setStart(child.firstChild!, 0);
    range.setEnd(child.firstChild!, 4);
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);

    const result = select();
    expect(result).not.toBeNull();
    expect(result!.getRangeAt(0).toString()).toBe('text');
    expect(result!.getRangeAt(0).commonAncestorContainer).toBe(child);
  });

  it('uses parentElement when the ancestor is a text node', () => {
    document.body.innerHTML = '<div id="root">plain</div>';
    const root = document.getElementById('root')!;
    const range = document.createRange();
    range.setStart(root.firstChild!, 0);
    range.setEnd(root.firstChild!, 5);
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);

    const result = select();
    expect(result).not.toBeNull();
    expect(result!.getRangeAt(0).commonAncestorContainer).toBe(root);
  });

  it('returns the selection when the ancestor has no parent element', () => {
    document.body.innerHTML = '<div id="root">plain</div>';
    const root = document.getElementById('root')!;
    const range = document.createRange();
    range.selectNodeContents(root);
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);

    const result = select();
    expect(result).not.toBeNull();
    expect(result!.getRangeAt(0).commonAncestorContainer).toBe(root);
  });
});

describe('from', () => {
  it('returns the same URL instance', () => {
    const url = new URL('https://example.com/a');
    expect(from(url)).toBe(url);
  });

  it('parses a string', () => {
    expect(from('https://example.com/a').href).toBe('https://example.com/a');
  });

  it('uses href from an object', () => {
    expect(from({ href: 'https://example.com/a' }).href).toBe(
      'https://example.com/a',
    );
  });

  it('uses src from an object', () => {
    expect(from({ src: 'https://example.com/a' }).href).toBe(
      'https://example.com/a',
    );
  });

  it('throws TypeError for invalid input', () => {
    // @ts-expect-error - testing runtime guard
    expect(() => from({})).toThrow(TypeError);
  });
});

describe('equiv', () => {
  it('matches identical origin, path, and query', () => {
    expect(
      equiv('https://example.com/a?x=1', 'https://example.com/a?x=1'),
    ).toBe(true);
  });

  it('ignores trailing slash differences', () => {
    expect(equiv('https://example.com/a/', 'https://example.com/a')).toBe(true);
  });

  it('normalizes duplicate slashes', () => {
    expect(equiv('https://example.com//a', 'https://example.com/a')).toBe(true);
  });

  it('detects differing query values', () => {
    expect(
      equiv('https://example.com/a?x=1', 'https://example.com/a?x=2'),
    ).toBe(false);
  });

  it('detects differing origins', () => {
    expect(equiv('https://example.com/a', 'https://other.com/a')).toBe(false);
  });
});

describe('is', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: new URL('https://sub.example.co.jp/path'),
    });
  });

  it('matches a parent domain', () => {
    expect(is('co.jp')).toBe(true);
    expect(is('example.co.jp')).toBe(true);
  });

  it('does not match an unrelated domain', () => {
    expect(is('other.com')).toBe(false);
  });
});

describe('tryFetch', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns exists:true for the current location', () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: new URL('https://example.com/a'),
    });
    return expect(tryFetch(new URL('https://example.com/a'))).resolves.toEqual({
      exists: true,
      url: 'https://example.com/a',
    });
  });

  it('returns exists:true on HEAD 200', async () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: new URL('https://other.com/'),
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => mockResponse(200, 'https://example.com/a')),
    );
    const result = await tryFetch(new URL('https://example.com/a'));
    expect(result.exists).toBe(true);
  });

  it('falls back to GET on 403/405', async () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: new URL('https://other.com/'),
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockResponse(403, 'https://example.com/a'))
      .mockResolvedValueOnce(mockResponse(200, 'https://example.com/a'));
    vi.stubGlobal('fetch', fetchMock);
    const result = await tryFetch(new URL('https://example.com/a'));
    expect(result.exists).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('returns exists:false on 404', async () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: new URL('https://other.com/'),
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => mockResponse(404, 'https://example.com/a')),
    );
    const result = await tryFetch(new URL('https://example.com/a'));
    expect(result.exists).toBe(false);
  });

  it('returns exists:false when fetch throws', async () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: new URL('https://other.com/'),
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network');
      }),
    );
    const result = await tryFetch(new URL('https://example.com/a'));
    expect(result.exists).toBe(false);
    warn.mockRestore();
  });
});

describe('exists', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns true for the current location', () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: new URL('https://example.com/a'),
    });
    return expect(exists(new URL('https://example.com/a'))).resolves.toBe(true);
  });

  it('returns true on HEAD 200', async () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: new URL('https://other.com/'),
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => mockResponse(200, 'https://example.com/a')),
    );
    expect(await exists(new URL('https://example.com/a'))).toBe(true);
  });

  it('returns false on 404', async () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: new URL('https://other.com/'),
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => mockResponse(404, 'https://example.com/a')),
    );
    expect(await exists(new URL('https://example.com/a'))).toBe(false);
  });
});

describe('open', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does nothing for an empty list', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockImplementation(() => true);
    await open([]);
    expect(openSpy).not.toHaveBeenCalled();
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it('opens a single url without confirmation', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockImplementation(() => true);
    await open(['https://example.com/a']);
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(openSpy).toHaveBeenCalledTimes(1);
  });

  it('confirms before opening multiple urls', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const confirmSpy = vi
      .spyOn(window, 'confirm')
      .mockImplementation(() => true);
    await open(['https://example.com/a', 'https://example.com/b']);
    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(openSpy).toHaveBeenCalledTimes(2);
  });

  it('falls back to copyToClipboard when confirmation is cancelled', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    vi.spyOn(window, 'confirm').mockImplementation(() => false);
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    await open([
      'https://example.com/a',
      'https://example.com/b',
      'https://example.com/c',
    ]);
    expect(openSpy).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});
