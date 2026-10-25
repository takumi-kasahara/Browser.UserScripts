#!/usr/bin/env node
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';
import { format, resolveConfig } from 'prettier';
import { getBaseDownloadUrl, getRootDir } from './utils.ts';

interface UserScript {
  name: string;
  href: string;
}

(async () => {
  const rootDir = getRootDir();
  const distRoot = path.join(rootDir, 'dist');
  const outputPath = path.join(rootDir, 'pages', 'UserScripts.html');
  const baseDownloadUrl = getBaseDownloadUrl();
  if (!fs.existsSync(distRoot)) {
    console.error(`${distRoot} not found.`);
    return;
  }
  const userScripts = collectUserScripts(distRoot, baseDownloadUrl);
  const config = await resolveConfig(outputPath);
  const code = await format(generate(userScripts), {
    ...config,
    filepath: outputPath,
    parser: 'html',
  });
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, code, 'utf-8');
  console.debug('created:', outputPath);

  /**
   * @param {string} dir
   * @param {string} baseDownloadUrl
   * @returns {UserScript[]}
   */
  function collectUserScripts(
    dir: string,
    baseDownloadUrl: string,
  ): UserScript[] {
    const userScripts: UserScript[] = [];
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      if (!file.isFile() || !file.name.endsWith('.user.js')) continue;
      const code = fs.readFileSync(path.join(dir, file.name), 'utf-8');
      userScripts.push({
        name:
          extractMetadata(code, '@name') ??
          file.name.replace(/\.user\.js$/i, ''),
        href: `${baseDownloadUrl}${encodeURIComponent(file.name)}`,
      });
    }
    return userScripts.sort((a: UserScript, b: UserScript): number =>
      a.name.localeCompare(b.name),
    );
  }
  /**
   * @param {string} code
   * @param {string} key
   * @returns {string | null}
   */
  function extractMetadata(code: string, key: string): string | null {
    const match = code.match(new RegExp(`^//\\s*${key}\\s+(.+)$`, 'm'));
    return match?.at(1)?.trim() ?? null;
  }
  function generate(userScripts: UserScript[]): string {
    const dom = new JSDOM();
    const { document } = dom.window;
    const doctype = document.implementation.createDocumentType('html', '', '');
    document.insertBefore(doctype, document.documentElement);
    document.documentElement.lang = 'en';

    const meta = document.createElement('meta');
    meta.setAttribute('charset', 'UTF-8');
    document.head.append(meta);

    const title = document.createElement('title');
    title.textContent = 'UserScripts';
    document.head.append(title);

    const list = document.createElement('ul');
    for (const userScript of userScripts) {
      const item = document.createElement('li');
      const anchor = document.createElement('a');
      anchor.setAttribute('href', userScript.href);
      anchor.textContent = userScript.name;
      item.append(anchor);
      list.append(item);
    }
    document.body.append(list);

    return dom.serialize();
  }
})();
