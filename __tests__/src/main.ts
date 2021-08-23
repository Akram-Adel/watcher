import { doneCallback } from 'fb-watchman';

import main, { client, subscriptionName, getSubscriptionObj } from '../../src/main';
import syncHandler from '../../src/syncHandler';

const mockWatchResponse = { watch: 'valid', relative_path: 'root' };
const mockClockResponse = { clock: 100 };
const mockOnSubscription = { subscription: subscriptionName, files: [{ name: 'any' }] };

jest.mock('fb-watchman', () => ({
  Client: jest.fn().mockImplementation(() => ({
    capabilityCheck: jest.fn()
      .mockImplementationOnce((_, fn) => fn(new Error('capabilityCheck error')))
      .mockImplementation((_, fn) => fn()),
    command: jest.fn()
      .mockImplementationOnce(jest.fn)
      .mockImplementationOnce((_, fn) => fn(new Error('command error')))
      .mockImplementation((commands: Array<string>, fn: doneCallback) => {
        if (commands.indexOf('watch-project') !== -1) fn(null, mockWatchResponse);
        else if (commands.indexOf('clock') !== -1) fn(null, mockClockResponse);
        else fn(null);
      }),
    on: jest.fn()
      .mockImplementationOnce(jest.fn)
      .mockImplementationOnce(jest.fn)
      .mockImplementationOnce((_, fn) => fn({ subscription: 'any' }))
      .mockImplementation((_, fn) => fn(mockOnSubscription)),
  })),
}));

jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
}));

jest.mock('../../src/syncHandler', () => ({
  syncFile: jest.fn(),
}));

beforeAll(() => {
  process.argv = ['node', 'jest', 'valid'];
});

describe('index', () => {
  /** @calls capabilityCheck */
  it('should throw error when watchman capabilities has an error', () => {
    expect(() => main()).toThrow(/capabilityCheck error/);

    expect(client.capabilityCheck).toHaveBeenCalledTimes(1);
  });

  /** @calls capabilityCheck */
  /** @calls command */
  it('should issue watch command when a directory is provided', () => {
    const watchCommand = [['watch-project', 'valid'], expect.anything()];

    main();
    expect(client.command).toHaveBeenCalledWith(...watchCommand);

    expect(client.capabilityCheck).toHaveBeenCalledTimes(1);
    expect(client.command).toHaveBeenCalledTimes(1);
  });

  /** @calls capabilityCheck */
  /** @calls command */
  it('should throw error when watch command fails', () => {
    expect(() => main()).toThrow(/command error/);

    expect(client.capabilityCheck).toHaveBeenCalledTimes(1);
    expect(client.command).toHaveBeenCalledTimes(1);
  });

  it('can create clocked subscription object', () => {
    const clockedSubscriptionObj = {
      expression: ['suffix', ['js', 'ts']],
      fields: ['name', 'exists'],
      since: mockClockResponse.clock,
      relative_root: mockWatchResponse.relative_path,
    };

    const subscriptionObj = getSubscriptionObj(mockClockResponse, mockWatchResponse);
    expect(subscriptionObj).toEqual(clockedSubscriptionObj);
  });

  /** @calls capabilityCheck */
  /** @calls command x3 */
  /** @calls on */
  it('should issue clocked subscribe command when watch command succeed', () => {
    const clockCommand = [['clock', expect.anything()], expect.anything()];
    const subscriptionObj = getSubscriptionObj(mockClockResponse, mockWatchResponse);
    const subscribeCommand = [['subscribe', 'valid', expect.anything(), subscriptionObj], expect.anything()];

    main();
    expect(client.command).toHaveBeenCalledWith(...clockCommand);
    expect(client.command).toHaveBeenCalledWith(...subscribeCommand);

    expect(client.capabilityCheck).toHaveBeenCalledTimes(1);
    expect(client.command).toHaveBeenCalledTimes(3);
    expect(client.on).toHaveBeenCalledTimes(1);
  });

  /** @calls capabilityCheck */
  /** @calls command x3 */
  /** @calls on */
  it('should subscribe to client events', () => {
    main();
    expect(client.on).toHaveBeenCalledWith('subscription', expect.anything());

    expect(client.capabilityCheck).toHaveBeenCalledTimes(1);
    expect(client.command).toHaveBeenCalledTimes(3);
    expect(client.on).toHaveBeenCalledTimes(1);
  });

  /** @calls capabilityCheck x2 */
  /** @calls command x6 */
  /** @calls on x2 */
  it('should not respond to any subscriptions other than issued ones', () => {
    main();
    expect(syncHandler.syncFile).not.toHaveBeenCalled();

    main();
    expect(syncHandler.syncFile).toHaveBeenCalledWith(mockOnSubscription.files[0]);

    expect(client.capabilityCheck).toHaveBeenCalledTimes(2);
    expect(client.command).toHaveBeenCalledTimes(6);
    expect(client.on).toHaveBeenCalledTimes(2);
  });
});
