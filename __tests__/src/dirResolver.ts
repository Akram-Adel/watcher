import dirResolver, { projectsRoot } from '../../src/dirResolver';

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

  it('should resolve project flag correctly', () => {
    const projectName = 'ProjectName';
    process.argv = ['node', 'jest', `--project=${projectName}`];

    expect(dirResolver()).toBe(`${projectsRoot}${projectName}`);
  });

  it('should throw if resolved project is an invalid directory', () => {
    process.argv = ['node', 'jest', '--project=invalid'];

    expect(() => dirResolver()).toThrow();
  });
});
