import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { sleep, waitForElement } from '../src/modules/DocumentExtensions.js';

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
