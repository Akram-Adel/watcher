import { doneCallback } from 'fb-watchman';

import main, { client, subscriptionName, getSubscriptionObj } from '../../src/main';
import { SingleSyncHandler, LinkedSyncHandler } from '../../src/syncHandler';

const mockOnSubscription = { subscription: subscriptionName, files: [{ name: 'any' }], root: 'subRoot' };
const mockWatchResponse = { watch: 'valid', relative_path: 'root' };
const mockClockResponse = { clock: 100 };

jest.mock('fb-watchman', () => ({
  Client: jest.fn().mockImplementation(() => ({
    capabilityCheck: jest.fn((_, fn) => fn()),
    on: jest.fn((_, fn) => fn(mockOnSubscription)),
    command: jest.fn((commands: Array<string>, fn: doneCallback) => {
      if (commands.indexOf('watch-project') !== -1) fn(null, mockWatchResponse);
      else if (commands.indexOf('clock') !== -1) fn(null, mockClockResponse);
      else fn(null);
    }),
  })),
}));

jest.mock('fs', () => ({ existsSync: jest.fn(() => true) }));

jest.mock('../../src/syncHandler');
jest.mock('../../src/resolvers/getProject', () => jest.fn(() => 'project'));
jest.mock('../../src/resolvers/getLinkedProjects', () => jest.fn(() => ['project1', 'project2']));

beforeEach(() => { process.argv = ['node', 'jest']; });

describe('main', () => {
  it('should throw when watchman capabilities has an error', () => {
    (client.capabilityCheck as jest.Mock)
      .mockImplementationOnce((_, fn) => fn(new Error('capabilityCheck error')));

    expect(() => main()).toThrow('capabilityCheck error');
  });

  it('should create SingleSyncHandler and issue watch command when a directory is provided', () => {
    main();
    expect(SingleSyncHandler).toHaveBeenCalled();
    expect(client.command).toHaveBeenCalledWith(['watch-project', 'project'], expect.anything());
  });

  it('should create LinkedSyncHandler when --link flag is provided', () => {
    process.argv = ['node', 'jest', '--link=link'];

    main();
    expect(LinkedSyncHandler).toHaveBeenCalled();
  });

  it('should issue multiple watch commands for each project in the provided link', () => {
    process.argv = ['node', 'jest', '--link=link'];

    main();
    expect(client.command).toHaveBeenCalledWith(['watch-project', 'project1'], expect.anything());
    expect(client.command).toHaveBeenCalledWith(['watch-project', 'project2'], expect.anything());
  });

  it('should throw when watch command fails', () => {
    (client.command as jest.Mock)
      .mockImplementationOnce((_, fn) => fn(new Error('command error')));

    expect(() => main()).toThrow('command error');
  });

  it('can create clocked subscription object', () => {
    const clockedSubscriptionObj = {
      expression: ['suffix', ['js', 'ts']],
      fields: ['name', 'exists'],
      since: mockClockResponse.clock,
      relative_root: mockWatchResponse.relative_path as string | undefined,
    };

    let subscriptionObj = getSubscriptionObj(mockClockResponse, mockWatchResponse);
    expect(subscriptionObj).toEqual(clockedSubscriptionObj);

    delete clockedSubscriptionObj.relative_root;
    subscriptionObj = getSubscriptionObj(mockClockResponse);
    expect(subscriptionObj).toEqual(clockedSubscriptionObj);
  });

  it('should issue clocked subscribe command when watch command succeed', () => {
    const clockCommand = [['clock', expect.anything()], expect.anything()];
    const subscriptionObj = getSubscriptionObj(mockClockResponse, mockWatchResponse);
    const subscribeCommand = [['subscribe', 'valid', expect.anything(), subscriptionObj], expect.anything()];

    main();
    expect(client.command).toHaveBeenCalledWith(...clockCommand);
    expect(client.command).toHaveBeenCalledWith(...subscribeCommand);
  });

  it('should subscribe to client events', () => {
    main();
    expect(client.on).toHaveBeenCalledWith('subscription', expect.anything());
  });

  it('should subscribe only once to client events for linked projects', () => {
    process.argv = ['node', 'jest', '--link=link'];

    main();
    expect(client.on).toHaveBeenCalledTimes(1);
    expect(client.on).toHaveBeenCalledWith('subscription', expect.anything());
  });

  it('should not respond to any subscriptions other than issued ones', () => {
    (client.on as jest.Mock)
      .mockImplementationOnce((_, fn) => fn({ subscription: 'any' }));

    main();
    expect(
      ((SingleSyncHandler as jest.Mock)
        .mock.instances[0] as SingleSyncHandler)
        .syncFile,
    ).not.toHaveBeenCalled();

    main();
    expect(
      ((SingleSyncHandler as jest.Mock)
        .mock.instances[1] as SingleSyncHandler)
        .syncFile,
    ).toHaveBeenCalledWith(mockOnSubscription.files[0], 'subRoot');
  });
});
