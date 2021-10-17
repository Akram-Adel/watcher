import { File } from '../../../src/syncHandler';
import getFile from '../../../src/resolvers/getFile';

const mockFile: File = { name: 'name', exists: true };

function mockGetFile(fileIgnorePattern: Array<string> | undefined): typeof getFile {
  jest.resetModules();
  jest.setMock('../../../configs.json', ({ fileIgnorePattern }));
  return require('../../../src/resolvers/getFile').default;
}

describe('getFile', () => {
  it('should return file when no fileIgnorePattern in configs', () => {
    expect(mockGetFile(undefined)(mockFile)).toBe(mockFile);
  });

  it('should return file when fileIgnorePattern is empty', () => {
    expect(mockGetFile([])(mockFile)).toBe(mockFile);
  });

  it('should return undefined when one of fileIgnorePattern match file name', () => {
    expect(mockGetFile(['.+'])(mockFile)).toBe(undefined);
    expect(mockGetFile(['na'])(mockFile)).toBe(undefined);
  });

  it('should return file when none of fileIgnorePattern match file name', () => {
    expect(mockGetFile(['unmatch'])(mockFile)).toBe(mockFile);
    expect(mockGetFile(['naS'])(mockFile)).toBe(mockFile);
  });

  it('should return undefined when the second matcher match file name', () => {
    expect(mockGetFile(['unmatch', '.+'])(mockFile)).toBe(undefined);
  });

  it('should return undefined when matcher matches file directory', () => {
    const mockFileDirectory: File = { name: '__test__/name.js', exists: true };
    expect(mockGetFile(['__test__'])(mockFileDirectory)).toBe(undefined);
  });
});
