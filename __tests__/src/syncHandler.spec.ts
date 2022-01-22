import fs from 'fs';

import getFile from '../../src/resolvers/getFile';
import { SyncHandlerBase, SingleSyncHandler, LinkedSyncHandler } from '../../src/syncHandler';

class TestSyncHandlerBase extends SyncHandlerBase {}

jest.mock('fs', () => ({
  copyFileSync: jest.fn(),
  existsSync: jest.fn(() => true),
  mkdirSync: jest.fn(),
  rmSync: jest.fn(),
  rmdirSync: jest.fn(),
  readdirSync: jest.fn(() => ['file']),
}));

const mockFile = { name: 'dir/file.js', exists: true };
jest.mock('../../src/resolvers/getFile', () => jest.fn((file) => file));
jest.mock('../../src/resolvers/getLinkedRoot', () => jest.fn(() => 'root'));
jest.mock('../../src/resolvers/getProject', () => jest.fn(() => 'project'));
jest.mock('../../src/resolvers/getRoot', () => jest.fn(() => 'root'));

describe('syncHandler.SyncHandlerBase', () => {
  it('should ignore tests files', () => {
    (getFile as jest.Mock).mockReturnValueOnce(undefined);
    const syncHandlerBase = new TestSyncHandlerBase();

    syncHandlerBase.syncFile(mockFile, '');

    expect(fs.copyFileSync).not.toHaveBeenCalled();
    expect(fs.mkdirSync).not.toHaveBeenCalled();
    expect(fs.rmSync).not.toHaveBeenCalled();
  });

  it('should copy existing/new file', () => {
    const syncHandlerBase = new TestSyncHandlerBase();
    jest.spyOn(syncHandlerBase, 'from', 'get').mockReturnValue('project');
    jest.spyOn(syncHandlerBase, 'to', 'get').mockReturnValue('root');

    syncHandlerBase.syncFile(mockFile, '');
    expect(fs.copyFileSync)
      .toHaveBeenCalledWith('project/dir/file.js', 'root/dir/file.js');
  });

  it('should create new directory for new files in new directories', () => {
    const syncHandlerBase = new TestSyncHandlerBase();
    jest.spyOn(syncHandlerBase, 'to', 'get').mockReturnValue('root');
    (fs.existsSync as jest.Mock)
      .mockImplementationOnce(() => false)
      .mockImplementationOnce(() => false);

    syncHandlerBase.syncFile(mockFile, '');
    expect(fs.mkdirSync).toHaveBeenCalledWith('root/dir', expect.anything());
  });

  it('should delete removed file', () => {
    const syncHandlerBase = new TestSyncHandlerBase();
    jest.spyOn(syncHandlerBase, 'to', 'get').mockReturnValue('root');

    syncHandlerBase.syncFile({ ...mockFile, exists: false }, '');
    expect(fs.rmSync).toHaveBeenCalledWith('root/dir/file.js');
  });

  it('should recusively delete file direcotries if they are empty', () => {
    const syncHandlerBase = new TestSyncHandlerBase();
    jest.spyOn(syncHandlerBase, 'to', 'get').mockReturnValue('root');
    (fs.readdirSync as jest.Mock)
      .mockImplementationOnce(() => [])
      .mockImplementationOnce(() => []);

    syncHandlerBase.syncFile({ name: 'dir1/dir2/file.js', exists: false }, '');
    expect(fs.rmdirSync).toHaveBeenCalledTimes(2);
    expect(fs.rmdirSync).toHaveBeenCalledWith('root/dir1/dir2');
    expect(fs.rmdirSync).toHaveBeenCalledWith('root/dir1');
  });
});

describe('syncHandler.SingleSyncHandler', () => {
  it('should set from/to roots correctly', () => {
    const singleSyncHandler = new SingleSyncHandler();

    expect(singleSyncHandler.from).toBe('project');
    expect(singleSyncHandler.to).toBe('root');
  });
});

describe('syncHandler.LinkedSyncHandler', () => {
  it('should set fromRoot to syncFile root', () => {
    const multiSyncHandler = new LinkedSyncHandler();

    multiSyncHandler.syncFile(mockFile, 'project');
    expect(multiSyncHandler.from).toBe('project');
  });
});
