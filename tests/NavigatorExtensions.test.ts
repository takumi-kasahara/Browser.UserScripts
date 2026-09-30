import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyToClipboard } from '../src/modules/NavigatorExtensions.js';

describe('copyToClipboard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('writes text and alerts on success (string item)', async () => {
    const writeText = vi.fn(async () => {});
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText, write: vi.fn(async () => {}) },
    });
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    await copyToClipboard('Done:', 'hello');

    expect(writeText).toHaveBeenCalledWith('hello');
    expect(alertSpy).toHaveBeenCalledWith('Done:');
    alertSpy.mockRestore();
  });

  it('writes a ClipboardItem and alerts on success', async () => {
    const write = vi.fn(async () => {});
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn(async () => {}), write },
    });
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    const item = new ClipboardItem({ 'text/plain': new Blob(['x']) });
    await copyToClipboard('Done:', item);

    expect(write).toHaveBeenCalledWith([item]);
    expect(alertSpy).toHaveBeenCalledWith('Done:');
    alertSpy.mockRestore();
  });

  it('falls back to prompt when clipboard write throws', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn(async () => {
          throw new Error('denied');
        }),
        write: vi.fn(async () => {
          throw new Error('denied');
        }),
      },
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const promptSpy = vi.spyOn(window, 'prompt').mockImplementation(() => null);

    await copyToClipboard('Copy:', 'text');

    expect(promptSpy).toHaveBeenCalledWith('Copy:', 'text');
    warn.mockRestore();
    promptSpy.mockRestore();
  });

  it('writes text when ClipboardItem is undefined', async () => {
    const original = globalThis.ClipboardItem;
    // @ts-expect-error - simulate missing ClipboardItem
    globalThis.ClipboardItem = undefined;
    const writeText = vi.fn(async () => {});
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText, write: vi.fn(async () => {}) },
    });
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    await copyToClipboard('Done:', 'hello');

    expect(writeText).toHaveBeenCalledWith('hello');
    expect(alertSpy).toHaveBeenCalledWith('Done:');
    alertSpy.mockRestore();
    globalThis.ClipboardItem = original;
  });
});
