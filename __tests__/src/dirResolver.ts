import dirResolver from '../../src/dirResolver';
import configs from '../../configs.json';

jest.mock('fs', () => ({
  existsSync: jest.fn((i: string) => !i.includes('invalid')),
}));

describe('dirResolver', () => {
  it('should throw error when no/invalid directory is provided', () => {
    process.argv = ['node', 'jest'];
    expect(() => dirResolver()).toThrow(/no\/invalid directory.+provided/);

    process.argv = ['node', 'jest', 'invalid'];
    expect(() => dirResolver()).toThrow(/no\/invalid directory.+provided/);
  });

  it('should return directory path when provided directory is valid', () => {
    process.argv = ['node', 'jest', 'valid'];
    expect(dirResolver()).toBe('valid');
  });

  it('should throw when given --project flag without project configuration', () => {
    jest.resetModules();
    jest.setMock('../../configs.json', ({ }));
    const dirResolverReq = require('../../src/dirResolver').default;

    process.argv = ['node', 'jest', '--project=Project'];
    expect(() => dirResolverReq()).toThrow();
  });

  it('should resolve --project flag correctly', () => {
    process.argv = ['node', 'jest', '--project=name'];
    expect(dirResolver()).toBe(`${configs.project}name`);
  });

  it('should throw if resolved project is an invalid directory', () => {
    process.argv = ['node', 'jest', '--project=invalid'];
    expect(() => dirResolver()).toThrow();
  });
});
