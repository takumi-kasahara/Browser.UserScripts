#!/usr/bin/env node
import { build } from 'esbuild';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getRootDir } from './utils.ts';

(async () => {
  const rootDir = getRootDir();
  const srcDir = path.join(rootDir, 'src', 'scripts');
  const outDir = path.join(rootDir, 'dist');
  try {
    await fs.rm(outDir, { recursive: true });
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (!(err.code === 'ENOENT')) throw e;
  }
  await fs.mkdir(outDir, { recursive: true });

  const files = (
    await fs.readdir(srcDir, { recursive: false, withFileTypes: true })
  )
    .filter(x => x.isFile())
    .map(x => path.join(x.parentPath, x.name))
    .filter(x => !/\.test\.[cm]?[jt]sx?$/.test(x));
  for (const file of files) {
    const source = await fs.readFile(file, 'utf-8');
    const match = source.match(
      /\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==/,
    );
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
      await fs.mkdir(path.join(distDir), { recursive: true });

    const fileName = `${path.basename(file, path.extname(file))}.js`;
    console.debug('create:', fileName);
    await fs.writeFile(path.join(distDir, fileName), outputFile.text, 'utf-8');
  }
})();
