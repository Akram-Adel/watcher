const mockFile = { name: 'name' };

function getMockedFn(fileIgnorePattern: Array<string> | undefined) {
  jest.resetModules();
  jest.setMock('../../../configs.json', ({ fileIgnorePattern }));
  return require('../../../src/resolvers/getFile').default;
}

describe('getFile', () => {
  it('should return file when no fileIgnorePattern in configs', () => {
    const getFileReq = getMockedFn(undefined);
    expect(getFileReq(mockFile)).toBe(mockFile);
  });

  it('should return file when fileIgnorePattern is empty', () => {
    const getFileReq = getMockedFn([]);
    expect(getFileReq(mockFile)).toBe(mockFile);
  });

  it('should return undefined when one of fileIgnorePattern match file name', () => {
    let getFileReq = getMockedFn(['.+']);
    expect(getFileReq(mockFile)).toBe(undefined);

    getFileReq = getMockedFn(['na']);
    expect(getFileReq(mockFile)).toBe(undefined);
  });

  it('should return file when none of fileIgnorePattern match file name', () => {
    let getFileReq = getMockedFn(['unmatch']);
    expect(getFileReq(mockFile)).toBe(mockFile);

    getFileReq = getMockedFn(['naS']);
    expect(getFileReq(mockFile)).toBe(mockFile);
  });

  it('should return undefined when the second matcher match file name', () => {
    const getFileReq = getMockedFn(['unmatch', '.+']);
    expect(getFileReq(mockFile)).toBe(undefined);
  });

  it('should return undefined when matcher matches file directory', () => {
    const mockFileDirectory = { name: '__test__/name.js' };

    const getFileReq = getMockedFn(['__test__']);
    expect(getFileReq(mockFileDirectory)).toBe(undefined);
  });
});
