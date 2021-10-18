import getProject from '../../../src/resolvers/getProject';

jest.mock('fs', () => ({
  existsSync: jest.fn((i: string) => !i.includes('invalid')),
}));

jest.mock('../../../configs.json', () => ({ aliase: { aliase: 'resolved/valid' } }));

describe('getProject', () => {
  it('should throw when no/invalid project input', () => {
    process.argv = ['node', 'jest'];
    expect(() => getProject()).toThrow('no/invalid directory provided');

    process.argv = ['node', 'jest', 'invalid'];
    expect(() => getProject()).toThrow('no/invalid directory provided');
  });

  it('should return input dir when no aliases in configuration and input dir is valid', () => {
    jest.resetModules();
    jest.setMock('../../../configs.json', ({ }));
    const getProjectReq = require('../../../src/resolvers/getProject').default;

    process.argv = ['node', 'jest', '--project=valid'];
    expect(getProjectReq()).toBe('valid');
  });

  it('should throw when no aliases in configuration and input dir is invalid', () => {
    jest.resetModules();
    jest.setMock('../../../configs.json', ({ }));
    const getProjectReq = require('../../../src/resolvers/getProject').default;

    process.argv = ['node', 'jest', '--project=invalid'];
    expect(() => getProjectReq()).toThrow('no/invalid directory provided');
  });

  it('should resolve aliase inputs', () => {
    process.argv = ['node', 'jest', '--project=aliase'];
    expect(getProject()).toBe('resolved/valid');
  });

  it('should throw when resolved aliase is invalid directory', () => {
    jest.resetModules();
    jest.setMock('../../../configs.json', ({ aliase: { aliase: 'resolved/invalid' } }));
    const getProjectReq = require('../../../src/resolvers/getProject').default;

    process.argv = ['node', 'jest', '--project=aliase'];
    expect(() => getProjectReq()).toThrow('no/invalid directory provided');
  });

  it('should resolve root when aliases is provided but doesnt match input', () => {
    process.argv = ['node', 'jest', '--project=valid'];
    expect(getProject()).toBe('valid');
  });
});
