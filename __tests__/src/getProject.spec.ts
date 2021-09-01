import getProject from '../../src/getProject';
import configs from '../../configs.json';

jest.mock('fs', () => ({
  existsSync: jest.fn((i: string) => !i.includes('invalid')),
}));

describe('getProject', () => {
  it('should throw error when no/invalid directory is provided', () => {
    process.argv = ['node', 'jest'];
    expect(() => getProject()).toThrow(/no\/invalid directory.+provided/);

    process.argv = ['node', 'jest', 'invalid'];
    expect(() => getProject()).toThrow(/no\/invalid directory.+provided/);
  });

  it('should return directory path when provided directory is valid', () => {
    process.argv = ['node', 'jest', 'valid'];
    expect(getProject()).toBe('valid');
  });

  it('should throw when given --project flag without project configuration', () => {
    jest.resetModules();
    jest.setMock('../../configs.json', ({ }));
    const dirResolverReq = require('../../src/getProject').default;

    process.argv = ['node', 'jest', '--project=Project'];
    expect(() => dirResolverReq()).toThrow();
  });

  it('should resolve --project flag correctly', () => {
    process.argv = ['node', 'jest', '--project=name'];
    expect(getProject()).toBe(`${configs.project}name`);
  });

  it('should throw if resolved project is an invalid directory', () => {
    process.argv = ['node', 'jest', '--project=invalid'];
    expect(() => getProject()).toThrow();
  });
});
