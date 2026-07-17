#!/usr/bin/env node
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

(async () => {
  const rootDir = getRootDir();
  const srcDir = path.join(rootDir, 'src', 'scripts');
  const outDir = path.join(rootDir, 'dist');
  if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const files = fs.readdirSync(srcDir, { recursive: false, withFileTypes: true })
    .filter(x => x.isFile())
    .map(x => path.join(x.parentPath, x.name))
    .filter(x => !/\.test\.[cm]?[jt]sx?$/.test(x));
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf-8');
    const match = source.match(/\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==/);
    const banner = match ? match[0] : '';
    const bundled = await build({
      entryPoints: [file],
      bundle: true,
      minify: false,
      write: false,
      legalComments: 'none',
      format: 'iife',
      target: 'esnext',
      platform: 'browser',
      banner: { js: banner },
    });
    const outputFile = bundled.outputFiles?.at(0);
    if (!outputFile?.text) continue;
    const distDir = path.join(path.dirname(file).replace(srcDir, outDir));
    if (distDir !== outDir)
      fs.mkdirSync(path.join(distDir), { recursive: true });

    const fileName = `${path.basename(file, path.extname(file))}.js`;
    console.debug('create:', fileName);
    fs.writeFileSync(
      path.join(distDir, fileName),
      outputFile.text,
      'utf-8',
    );
  }

  function getRootDir(): string {
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    return path.resolve(currentDir, '..');
  }
})();
