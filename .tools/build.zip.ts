#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import AdmZip from 'adm-zip';

(() => {
  const rootDir = getRootDir();
  const outDir = path.join(rootDir, 'dist');
  const binDir = path.join(rootDir, 'bin');
  const zipFile = path.join(binDir, 'Greasemonkey.zip');

  if (!fs.existsSync(outDir)) {
    console.error(`${outDir} not found.`);
    return;
  }
  if (!fs.existsSync(binDir))
    fs.mkdirSync(binDir, { recursive: true });

  const fileNames = collectUserScripts(outDir);
  if (fileNames.length === 0) {
    console.warn(`${outDir}/*.user.js not found.`);
    return;
  }

  const zip = loadZip(zipFile);
  for (const fileName of fileNames) {
    const entryName = computeEntryName(fileName);
    const filePath = path.join(outDir, fileName);
    replace(zip, filePath, entryName);
  }
  writeZip(zip, zipFile);

  function getRootDir(): string {
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    return path.resolve(currentDir, '..');
  }
  /**
   * @param {string} outDir
   */
  function collectUserScripts(outDir: string): string[] {
    return fs.readdirSync(outDir, { withFileTypes: true })
      .filter((d: fs.Dirent) => d.isFile() && d.name.endsWith('.user.js'))
      .map((d: fs.Dirent) => d.name);
  }
  /**
   * @param {string} fileName
   */
  function computeEntryName(fileName: string): string {
    const outDir = fileName.replace(/\.user\.js$/i, '');
    return `${outDir}/${encodeURIComponent(fileName)}`;
  }
  /**
   * @param {string} zipPath
   * @returns {AdmZip}
   */
  function loadZip(zipPath: string): AdmZip {
    return fs.existsSync(zipPath) ? new AdmZip(zipPath) : new AdmZip();
  }
  /**
   * @param {AdmZip} zip
   * @param {string} localPath
   * @param {string} entryName
   */
  function replace(zip: AdmZip, localPath: string, entryName: string): void {
    if (zip.getEntry(entryName)) {
      zip.deleteFile(entryName);
      console.debug('replace:', entryName);
    }
    else
      throw new Error(`entry not found:\t${entryName}`);
    const zipPath = entryName.split('/').slice(0, -1).join('/');
    zip.addLocalFile(localPath, zipPath, path.basename(entryName));
  }
  /**
   * @param {AdmZip} zip
   * @param {string} zipPath
   */
  function writeZip(zip: AdmZip, zipPath: string): void {
    for (const entry of zip.getEntries())
      entry.header.time = null;

    zip.writeZip(zipPath);
    console.debug('done:', zipPath);
  }
})();
