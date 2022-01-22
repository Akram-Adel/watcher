import fs from 'fs';

import { File } from '../typings.d';

import getFile from './resolvers/getFile';
import getLinkedRoot from './resolvers/getLinkedRoot';
import getProject from './resolvers/getProject';
import getRoot from './resolvers/getRoot';

type LogColors = 'Green' | 'Yellow' | 'Red' | 'Magenta';
export abstract class SyncHandlerBase {
  get from(): string | undefined { return this.fromRoot; }
  protected fromRoot?: string

  get to(): string | undefined { return this.toRoot; }
  protected toRoot?: string

  public syncFile(subscriptionFile: File, _: string): void {
    const file = getFile(subscriptionFile);

    if (!file) this.ignoreFile(subscriptionFile);
    else if (!this.distFileExist(file)) this.handleFileCreation(file.name);
    else if (!file.exists) this.handleFileDeletion(file.name);
    else this.copyFile(file.name, 'Yellow');
  }

  protected ignoreFile(subscriptionFile: File): void {
    this.colorfulLog('Magenta', subscriptionFile.name, 'ignore');
  }

  protected handleFileCreation(fileName: string): void {
    const distDir = this.getDistDir(fileName);

    /* istanbul ignore else */
    if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

    this.copyFile(fileName, 'Green');
  }

  protected handleFileDeletion(fileName: string): void {
    fs.rmSync(this.getDistFile(fileName));

    this.deleteDir(this.getDistDir(fileName));

    this.colorfulLog('Red', fileName);
  }

  protected copyFile(fileName: string, color: LogColors): void {
    fs.copyFileSync(this.getSrcFile(fileName), this.getDistFile(fileName));

    this.colorfulLog(color, fileName);
  }

  private deleteDir(dirName: string) {
    if (fs.readdirSync(dirName).length !== 0) return;

    fs.rmdirSync(dirName);

    this.deleteDir(dirName.slice(0, dirName.lastIndexOf('/')));
  }

  private getDistDir(fileName: string): string {
    const distFile = this.getDistFile(fileName);
    return distFile.slice(0, distFile.lastIndexOf('/'));
  }

  private getSrcFile(fileName: string): string {
    return `${this.from}/${fileName}`;
  }

  private getDistFile(fileName: string): string {
    return `${this.to}/${fileName}`;
  }

  /* istanbul ignore next */
  private colorfulLog(color: LogColors, fileName: string, operation = 'sync') {
    if (process.env.NODE_ENV === 'test') return;

    const colorNum = (color === 'Green') ? 2
      : (color === 'Yellow') ? 3
        : (color === 'Red') ? 1
          : 5;

    console.log(`\x1b[3${colorNum}m`,
      operation, 'changes from', fileName,
      '\x1b[0m');
  }

  protected distFileExist = (file: File): boolean => fs.existsSync(this.getDistFile(file.name))
}

export class SingleSyncHandler extends SyncHandlerBase {
  constructor() {
    super();
    this.fromRoot = getProject();
    this.toRoot = getRoot();
  }
}

export class LinkedSyncHandler extends SyncHandlerBase {
  get to(): string | undefined { return getLinkedRoot(this.from); }

  syncFile(subscriptionFile: File, root: string): void {
    this.fromRoot = root;
    super.syncFile(subscriptionFile, root);
  }
}
