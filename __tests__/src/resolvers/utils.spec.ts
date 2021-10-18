import { getInputWithFlag } from '../../../src/resolvers/utils';

describe('utils.getInputFlag', () => {
  it('should throw when flag is not of correct shape', () => {
    expect(() => getInputWithFlag('not correct')).toThrow('invalid requested flag');
  });

  it('should return undefined when flag doesnt exist', () => {
    expect(getInputWithFlag('nonExistent')).toBe(undefined);
  });

  it('should return input when flag exists', () => {
    process.argv = ['node', 'jest', '--existent=flag'];
    expect(getInputWithFlag('existent')).toBe('flag');
  });

  it('should return undefined when input not in correct shape', () => {
    process.argv = ['node', 'jest', '--existentflag'];
    expect(getInputWithFlag('existent')).toBe(undefined);

    process.argv = ['node', 'jest', 'existent=flag'];
    expect(getInputWithFlag('existent')).toBe(undefined);
  });
});
