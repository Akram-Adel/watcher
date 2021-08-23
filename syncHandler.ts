import fs from 'fs';

export type File = { name: string, exists: boolean }

export default class SyncHandler {
  private fromRoot: string
  private toRoot: string

  constructor(dir: string) {
    this.fromRoot = dir;

    const dirArray = dir.split('/');
    const project = dirArray[dirArray.length - 1].substr(String('REMOVED-ACTUAL-').length).toLocaleLowerCase();
    this.toRoot = `/Users/akram-adel/Documents/REMOVED-ACTUAL/REMOVED-ACTUAL-${project}`;
  }

  syncFile(file: File): void {
    const isOld = fs.existsSync(this.getToPath(file.name));

    if (file.exists && isOld) this.handleExistingFile(file.name);
    else if (file.exists) this.hanldeNewFile(file.name);
    else this.handleDeletedFile(file.name);
  }

  private handleExistingFile(fileName: string) {
    fs.copyFileSync(this.getFromPath(fileName), this.getToPath(fileName));

    this.colorfulLog('Yellow', fileName);
  }

  private hanldeNewFile(fileName: string) {
    const toDir = this.getToDir(fileName);
    if (!fs.existsSync(toDir)) fs.mkdirSync(toDir, { recursive: true });

    fs.copyFileSync(this.getFromPath(fileName), this.getToPath(fileName));

    this.colorfulLog('Green', fileName);
  }

  private handleDeletedFile(fileName: string) {
    fs.rmSync(this.getToPath(fileName));

    const toDir = this.getToDir(fileName);
    if (fs.readdirSync(toDir).length === 0) fs.rmdirSync(toDir);

    this.colorfulLog('Red', fileName);
  }

  private getToDir(fileName: string): string {
    const toPath = this.getToPath(fileName);
    return toPath.slice(0, toPath.lastIndexOf('/'));
  }

  private getFromPath(fileName: string): string {
    return `${this.fromRoot}/${fileName}`;
  }

  private getToPath(fileName: string): string {
    return `${this.toRoot}/${fileName}`;
  }

  private colorfulLog(color: 'Green' | 'Yellow' | 'Red', fileName: string): void {
    const colorNum = (color === 'Green') ? 2
      : (color === 'Yellow') ? 3
        : 1;
    console.log(`\x1b[3${colorNum}m`, 'sync changes from', fileName);
  }
}
