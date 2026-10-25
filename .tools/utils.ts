import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * @returns {string} the absolute path to the project root directory
 */
export function getRootDir(): string {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(currentDir, '..');
}
/**
 * @returns {string} the base URL where the built files are published
 */
export function getBaseDownloadUrl(): string {
  try {
    const remoteUrl = execSync('git remote get-url origin', {
      cwd: getRootDir(),
      encoding: 'utf8',
    }).trim();
    if (remoteUrl) {
      const repo = remoteUrl.replace(/\.git$/, '');
      const branch = execSync('git config --get init.defaultBranch', {
        cwd: getRootDir(),
        encoding: 'utf8',
      }).trim();
      return `${repo}/raw/refs/heads/${branch}/dist/`;
    }
  } catch (e) {
    console.warn(e);
  }
  return 'file:///';
}
