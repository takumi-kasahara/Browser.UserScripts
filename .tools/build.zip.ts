#!/usr/bin/env node
import AdmZip from 'adm-zip';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getBaseDownloadUrl, getRootDir } from './utils.ts';

(async () => {
  const rootDir = getRootDir();
  const outDir = path.join(rootDir, 'dist');
  const binDir = path.join(rootDir, 'bin');
  const zipFile = path.join(binDir, 'Greasemonkey.zip');
  const metadataTemplate = JSON.parse(
    await fs.readFile(path.join(rootDir, '.template', '.gm.json'), 'utf8'),
  );

  let fileNames: string[];
  try {
    fileNames = await collectUserScripts(outDir);
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (!(err.code === 'ENOENT')) throw e;
    console.error(`${outDir} not found.`);
    return;
  }
  await fs.mkdir(binDir, { recursive: true });

  if (fileNames.length === 0) {
    console.error(`${outDir}/*.user.js not found.`);
    return;
  }

  const zip = await loadZip(zipFile);
  const baseDownloadUrl = getBaseDownloadUrl();
  for (const fileName of fileNames) {
    const entryName = computeEntryName(fileName);
    const filePath = path.join(outDir, fileName);
    upsert(zip, filePath, entryName);
    addMetadata(zip, fileName, baseDownloadUrl);
  }
  writeZip(zip, zipFile);

  /**
   * @param {string} outDir
   * @returns {Promise<string[]>}
   */
  async function collectUserScripts(outDir: string): Promise<string[]> {
    return (await fs.readdir(outDir, { withFileTypes: true }))
      .filter(d => d.isFile() && d.name.endsWith('.user.js'))
      .map(d => d.name);
  }
  /**
   * @param {string} fileName
   */
  function computeEntryName(fileName: string): string {
    const outDir = fileName.replace(/\.user\.js$/i, '');
    return `${outDir}/${fileName}`;
  }
  /**
   * @param {string} zipPath
   * @returns {Promise<AdmZip>}
   */
  async function loadZip(zipPath: string): Promise<AdmZip> {
    try {
      return new AdmZip(await fs.readFile(zipPath));
    } catch (e) {
      const err = e as NodeJS.ErrnoException;
      if (!(err.code === 'ENOENT')) throw e;
      return new AdmZip();
    }
  }
  /**
   * @param {AdmZip} zip
   * @param {string} localPath
   * @param {string} entryName
   */
  function upsert(zip: AdmZip, localPath: string, entryName: string): void {
    const zipPath = entryName.split('/').slice(0, -1).join('/');
    const scriptEntries = zip.getEntries().filter(entry => {
      const entryPath = entry.entryName.replaceAll('\\', '/');
      const entryDirectory = path.posix.dirname(entryPath);
      const entryFileName = path.posix.basename(entryPath);
      return entryDirectory === zipPath && entryFileName.endsWith('.user.js');
    });

    for (const entry of scriptEntries) zip.deleteFile(entry.entryName);
    console.debug('create:', entryName);
    zip.addLocalFile(localPath, zipPath, path.basename(entryName));
  }
  /**
   * @param {AdmZip} zip
   * @param {string} fileName
   * @param {string} baseDownloadUrl
   */
  function addMetadata(
    zip: AdmZip,
    fileName: string,
    baseDownloadUrl: string,
  ): void {
    const scriptName = fileName.replace(/\.user\.js$/i, '');
    const entryName = `${scriptName}/.gm.json`;
    const downloadUrl = `${baseDownloadUrl}${encodeURIComponent(fileName)}`;

    const metadata = {
      ...metadataTemplate,
      downloadUrl,
    };
    zip.addFile(entryName, Buffer.from(JSON.stringify(metadata)));
    console.debug('create:', entryName);
  }
  /**
   * @param {AdmZip} zip
   * @param {string} zipPath
   */
  function writeZip(zip: AdmZip, zipPath: string): void {
    zip.writeZip(zipPath);
    console.debug('done:', zipPath);
  }
})();
