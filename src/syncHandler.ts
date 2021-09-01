import fs from 'fs';

import errorHandler from './errorHandler';
import getProject from './getProject';
import getFile from './getFile';
import configs from '../configs.json';

export type File = { name: string, exists: boolean }
type LogColors = 'Green' | 'Yellow' | 'Red' | 'Magenta';

class SyncHandler {
  get from(): string | undefined { return this.fromRoot; }
  private fromRoot?: string

  get to(): string | undefined { return this.toRoot; }
  private toRoot?: string

  constructor() {
    if (!configs.root) errorHandler.throwCoded(2);
    const project = getProject();

    this.fromRoot = project;

    const dirArray = project.split('/');
    const pkgName = dirArray[dirArray.length - 1]
      .substr(String('REMOVED-ACTUAL-').length)
      .toLocaleLowerCase();
    this.toRoot = configs.root + pkgName;
  }

  syncFile(subscriptionFile: File): void {
    const file = getFile(subscriptionFile);

    if (!file) this.ignoreFile(subscriptionFile);
    else if (!fs.existsSync(this.getFileDist(file.name))) this.handleFileCreation(file.name);
    else if (!file.exists) this.handleFileDeletion(file.name);
    else this.copyFile(file.name, 'Yellow');
  }

  private ignoreFile(subscriptionFile: File) {
    this.colorfulLog('Magenta', subscriptionFile.name, 'ignore');
  }

  private handleFileCreation(fileName: string) {
    const distDir = this.getDistDir(fileName);

    /* istanbul ignore else */
    if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

    this.copyFile(fileName, 'Green');
  }

  private handleFileDeletion(fileName: string) {
    fs.rmSync(this.getFileDist(fileName));

    this.deleteDir(this.getDistDir(fileName));

    this.colorfulLog('Red', fileName);
  }

  private copyFile(fileName: string, color: LogColors) {
    fs.copyFileSync(this.getFileSrc(fileName), this.getFileDist(fileName));

    this.colorfulLog(color, fileName);
  }

  private deleteDir(dirName: string) {
    if (fs.readdirSync(dirName).length !== 0) return;

    fs.rmdirSync(dirName);

    this.deleteDir(dirName.slice(0, dirName.lastIndexOf('/')));
  }

  private getDistDir(fileName: string): string {
    const fileDist = this.getFileDist(fileName);
    return fileDist.slice(0, fileDist.lastIndexOf('/'));
  }

  private getFileSrc(fileName: string): string {
    return `${this.from}/${fileName}`;
  }

  private getFileDist(fileName: string): string {
    return `${this.to}/${fileName}`;
  }

  private colorfulLog(color: LogColors, fileName: string, process = 'sync'): void {
    const colorNum = (color === 'Green') ? 2
      : (color === 'Yellow') ? 3
        : (color === 'Red') ? 1
          : 5;

    console.log(`\x1b[3${colorNum}m`,
      process, 'changes from', fileName,
      '\x1b[0m');
  }
}

const syncHandler = new SyncHandler();
export default syncHandler;
