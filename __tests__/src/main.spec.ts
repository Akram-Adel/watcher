import { doneCallback } from 'fb-watchman';

import main, { client, subscriptionName, getSubscriptionObj } from '../../src/main';
import syncHandler from '../../src/syncHandler';

const mockOnSubscription = { subscription: subscriptionName, files: [{ name: 'any' }] };
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
jest.mock('../../src/syncHandler', () => ({ syncFile: jest.fn() }));

beforeAll(() => { process.argv = ['node', 'jest', 'valid']; });

describe('index', () => {
  it('should throw error when watchman capabilities has an error', () => {
    (client.capabilityCheck as jest.Mock)
      .mockImplementationOnce((_, fn) => fn(new Error('capabilityCheck error')));

    expect(() => main()).toThrow(/capabilityCheck error/);
  });

  it('should issue watch command when a directory is provided', () => {
    const watchCommand = [['watch-project', 'valid'], expect.anything()];

    main();
    expect(client.command).toHaveBeenCalledWith(...watchCommand);
  });

  it('should throw error when watch command fails', () => {
    (client.command as jest.Mock)
      .mockImplementationOnce((_, fn) => fn(new Error('command error')));

    expect(() => main()).toThrow(/command error/);
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

  it('should not respond to any subscriptions other than issued ones', () => {
    (client.on as jest.Mock)
      .mockImplementationOnce((_, fn) => fn({ subscription: 'any' }));

    main();
    expect(syncHandler.syncFile).not.toHaveBeenCalled();

    main();
    expect(syncHandler.syncFile).toHaveBeenCalledWith(mockOnSubscription.files[0]);
  });
});
