declare module 'adm-zip' {
  export default class AdmZip {
    constructor(fileName?: string);
    getEntry(entryName: string): unknown;
    deleteFile(entryName: string): void;
    addLocalFile(localPath: string, zipPath?: string, zipName?: string): void;
    getEntries(): Array<{ header: { time: unknown } }>;
    writeZip(targetFileName?: string): void;
  }
}
