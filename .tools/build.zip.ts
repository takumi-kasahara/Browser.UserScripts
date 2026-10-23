#!/usr/bin/env node
import AdmZip from 'adm-zip';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

(() => {
  const rootDir = getRootDir();
  const outDir = path.join(rootDir, 'dist');
  const binDir = path.join(rootDir, 'bin');
  const zipFile = path.join(binDir, 'Greasemonkey.zip');
  const metadataTemplate = JSON.parse(
    fs.readFileSync(path.join(rootDir, '.template', '.gm.json'), 'utf8'),
  );

  if (!fs.existsSync(outDir)) {
    console.error(`${outDir} not found.`);
    return;
  }
  if (!fs.existsSync(binDir)) fs.mkdirSync(binDir, { recursive: true });

  const fileNames = collectUserScripts(outDir);
  if (fileNames.length === 0) {
    console.error(`${outDir}/*.user.js not found.`);
    return;
  }

  const zip = loadZip(zipFile);
  const baseDownloadUrl = getBaseDownloadUrl();
  for (const fileName of fileNames) {
    const entryName = computeEntryName(fileName);
    const filePath = path.join(outDir, fileName);
    upsert(zip, filePath, entryName);
    addMetadata(zip, fileName, baseDownloadUrl);
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
    return fs
      .readdirSync(outDir, { withFileTypes: true })
      .filter((d: fs.Dirent) => d.isFile() && d.name.endsWith('.user.js'))
      .map((d: fs.Dirent) => d.name);
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
   */
  function getBaseDownloadUrl(): string {
    try {
      const remoteUrl = execSync('git remote get-url origin', {
        encoding: 'utf8',
      }).trim();
      if (remoteUrl) {
        const repo = remoteUrl.replace(/\.git$/, '');
        const branch = execSync('git config --get init.defaultBranch', {
          encoding: 'utf8',
        }).trim();
        return `${repo}/raw/refs/heads/${branch}/dist/`;
      }
    } catch (e) {
      console.warn(e);
    }
    return 'file:///';
  }

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
    for (const entry of zip.getEntries()) entry.header.time = null;

    zip.writeZip(zipPath);
    console.debug('done:', zipPath);
  }
})();
