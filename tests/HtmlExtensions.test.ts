import { describe, expect, it } from 'vitest';
import {
  available,
  escape,
  extractElement,
  visible,
} from '../src/modules/HtmlExtensions.js';

describe('escape', () => {
  it('escapes &, <, >', () => {
    expect(escape('a&b<c>d')).toBe('a&amp;b&lt;c&gt;d');
  });

  it('leaves plain text unchanged', () => {
    expect(escape('hello world')).toBe('hello world');
  });
});

describe('available', () => {
  it('throws when element is null', () => {
    // @ts-expect-error - testing runtime guard
    expect(() => available(null)).toThrow(TypeError);
  });

  it('returns false when not connected', () => {
    const el = document.createElement('div');
    expect(available(el)).toBe(false);
  });

  it('returns true for a connected, enabled element', () => {
    const el = document.createElement('span');
    document.body.appendChild(el);
    expect(available(el)).toBe(true);
    el.remove();
  });

  it('returns false for a disabled input', () => {
    const input = document.createElement('input');
    input.disabled = true;
    document.body.appendChild(input);
    expect(available(input)).toBe(false);
    input.remove();
  });

  it('returns false when pointer-events is none', () => {
    const el = document.createElement('div');
    el.style.pointerEvents = 'none';
    document.body.appendChild(el);
    expect(available(el)).toBe(false);
    el.remove();
  });

  it('returns false when an ancestor is disabled', () => {
    const parent = document.createElement('fieldset');
    parent.disabled = true;
    const child = document.createElement('button');
    parent.appendChild(child);
    document.body.appendChild(parent);
    expect(available(child)).toBe(false);
    parent.remove();
  });
});

describe('visible', () => {
  it('throws when element is null', () => {
    // @ts-expect-error - testing runtime guard
    expect(() => visible(null)).toThrow(TypeError);
  });

  it('returns false when hidden attribute is set', () => {
    const el = document.createElement('div');
    el.hidden = true;
    document.body.appendChild(el);
    expect(visible(el)).toBe(false);
    el.remove();
  });

  it('returns false when display is none', () => {
    const el = document.createElement('div');
    el.style.display = 'none';
    document.body.appendChild(el);
    expect(visible(el)).toBe(false);
    el.remove();
  });

  it('returns false when visibility is hidden', () => {
    const el = document.createElement('div');
    el.style.visibility = 'hidden';
    document.body.appendChild(el);
    expect(visible(el)).toBe(false);
    el.remove();
  });

  it('returns true for a normally rendered element', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    expect(visible(el)).toBe(true);
    el.remove();
  });
});

describe('extractElement', () => {
  it('returns null when no matching property attributes exist', () => {
    const el = document.createElement('div');
    expect(extractElement(el, 'itemscope', 'itemprop')).toBeNull();
  });

  it('extracts a single property as a scalar', () => {
    const root = document.createElement('div');
    root.setAttribute('itemscope', '');
    const prop = document.createElement('meta');
    prop.setAttribute('itemprop', 'name');
    prop.setAttribute('content', 'Example');
    root.appendChild(prop);
    document.body.appendChild(root);

    const result = extractElement(root, 'itemscope', 'itemprop');
    expect(result).toEqual({ name: 'Example' });
    root.remove();
  });

  it('extracts multiple properties with the same key as an array', () => {
    const root = document.createElement('div');
    root.setAttribute('itemscope', '');
    for (const value of ['a', 'b']) {
      const prop = document.createElement('meta');
      prop.setAttribute('itemprop', 'tag');
      prop.setAttribute('content', value);
      root.appendChild(prop);
    }
    document.body.appendChild(root);

    const result = extractElement(root, 'itemscope', 'itemprop');
    expect(result).toEqual({ tag: ['a', 'b'] });
    root.remove();
  });

  it('uses textContent when no content attribute is present', () => {
    const root = document.createElement('div');
    root.setAttribute('itemscope', '');
    const prop = document.createElement('span');
    prop.setAttribute('itemprop', 'title');
    prop.textContent = 'Hello';
    root.appendChild(prop);
    document.body.appendChild(root);

    const result = extractElement(root, 'itemscope', 'itemprop');
    expect(result).toEqual({ title: 'Hello' });
    root.remove();
  });

  it('uses href for anchor elements', () => {
    const root = document.createElement('div');
    root.setAttribute('itemscope', '');
    const link = document.createElement('a');
    link.setAttribute('itemprop', 'url');
    link.href = 'https://example.com/page';
    root.appendChild(link);
    document.body.appendChild(root);

    const result = extractElement(root, 'itemscope', 'itemprop');
    expect(result).toEqual({ url: 'https://example.com/page' });
    root.remove();
  });
});
