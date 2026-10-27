import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  download,
  sleep,
  waitForElement,
} from '../src/modules/DocumentExtensions.js';

describe('download', () => {
  it('creates a temporary object URL and clicks an anchor with download name', () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:mock');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', {
      createObjectURL,
      revokeObjectURL,
    });

    const click = vi.fn();
    const anchor = document.createElement('a');
    anchor.click = click;
    const createElement = vi
      .spyOn(document, 'createElement')
      .mockReturnValue(anchor);

    download({ key: 'value' }, 'application/json', 'data.json');

    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(anchor.href).toBe('blob:mock');
    expect(anchor.download).toBe('data.json');
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock');

    createElement.mockRestore();
    vi.unstubAllGlobals();
  });
});

describe('sleep', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves after the given delay', async () => {
    const promise = sleep(1000);
    vi.advanceTimersByTime(1000);
    await expect(promise).resolves.toBeUndefined();
  });
});

describe('waitForElement', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the element immediately when present', async () => {
    const el = document.createElement('div');
    el.id = 'target';
    document.body.appendChild(el);

    const promise = waitForElement('#target');
    await vi.runAllTimersAsync();
    await expect(promise).resolves.toBe(el);
    el.remove();
  });

  it('returns null after exhausting retries', async () => {
    const promise = waitForElement('#missing', 3);
    await vi.runAllTimersAsync();
    await expect(promise).resolves.toBeNull();
  });

  it('returns the element once it appears during retries', async () => {
    const promise = waitForElement('#late');
    // advance past first sleep; element still missing
    await vi.advanceTimersByTimeAsync(1000);
    const el = document.createElement('div');
    el.id = 'late';
    document.body.appendChild(el);
    await vi.runAllTimersAsync();
    await expect(promise).resolves.toBe(el);
    el.remove();
  });
});
