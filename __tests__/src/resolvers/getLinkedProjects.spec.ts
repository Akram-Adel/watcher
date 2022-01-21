import getLinkedProject from '../../../src/resolvers/getLinkedProjects';

jest.mock('../../../configs.json', () => ({
  links: { link: { projects: ['project/valid'] } },
}));

describe('getLinkedProjects', () => {
  it('should throw when no/invalid link input', () => {
    process.argv = ['node', 'jest'];
    expect(() => getLinkedProject()).toThrow(/No link provided/);

    process.argv = ['node', 'jest', 'invalid'];
    expect(() => getLinkedProject()).toThrow(/No link provided/);
  });

  it('should throw when provided link is not in the configuration', () => {
    process.argv = ['node', 'jest', '--link=invalid'];
    expect(() => getLinkedProject()).toThrow(/Provided link cannot be found/);
  });

  it('should throw when provided link doesnt have projects', () => {
    jest.resetModules();
    jest.setMock('../../../configs.json', ({ links: { link: { } } }));
    const getLinkedProjectsReq = require('../../../src/resolvers/getLinkedProjects').default;

    process.argv = ['node', 'jest', '--link=link'];
    expect(() => getLinkedProjectsReq()).toThrow(/Provided link does not have projects/);
  });

  it('should resolve linked projects correctly provided correct link config', () => {
    expect(getLinkedProject()).toEqual(['project/valid']);
  });
});
