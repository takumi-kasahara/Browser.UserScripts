/* eslint-disable no-unused-vars */
declare module 'adm-zip' {
  export interface IZipEntry {
    entryName: string;
    name: string;
    isDirectory: boolean;
    header: {
      time: unknown;
    };
  }
  export default class AdmZip {
    constructor(fileName?: string | Buffer);
    getEntry(entryName: string): IZipEntry | null;
    deleteFile(entryName: string): void;
    addLocalFile(localPath: string, zipPath?: string, zipName?: string): void;
    addFile(
      entryName: string,
      content: Buffer,
      comment?: string,
      attr?: number,
    ): void;
    getEntries(): IZipEntry[];
    writeZip(targetFileName?: string): void;
  }
}
