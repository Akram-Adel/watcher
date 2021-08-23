import fs from 'fs';
import watchman from 'fb-watchman';

import ErrorHandler from './errorHandler';
import SyncHandler, { File } from './syncHandler';

export type Obj = { [key: string]: any }

const isTesting: boolean = (() => {
  const process1 = process.argv[0].split('/');
  const process2 = process.argv[1].split('/');

  return process1[process1.length - 1] === 'node'
    && process2[process2.length - 1] === 'jest';
})();

if (!isTesting) main();

const client = new watchman.Client();
const errorHandler = new ErrorHandler();
const subscriptionName = 'watchman-subscription';
const syncHandler = new SyncHandler();

function main(): void {
  client.capabilityCheck({ optional: [], required: ['relative_root'] }, (error) => {
    errorHandler.throwIf(error);

    client.command(['watch-project', getDirectory()], handleWatchCommand);
  });
}

function handleWatchCommand(error?: Error | null, resp?: any) {
  errorHandler.throwIf(error);
  if ('warning' in resp) console.log('warning: ', resp.warning);
  console.log('>> watch established on ', resp.watch, ' relative_path', resp.relative_path);

  syncHandler.setDir(getDirectory());
  issueClockedSubscription(resp);
  subscribeToIssuedSubscription();
}

function getDirectory(): string {
  const dir: string | undefined = process.argv[2];
  if (!dir || !fs.existsSync(dir)) errorHandler.throwCoded(1);
  return dir;
}

function issueClockedSubscription(watchResponse: any) {
  client.command(['clock', watchResponse.watch], (clockError, clockResponse) => {
    errorHandler.throwIf(clockError);

    const subscribeCommand = [
      'subscribe',
      watchResponse.watch,
      subscriptionName,
      getSubscriptionObj(clockResponse, watchResponse),
    ];

    client.command(subscribeCommand, (subError, subResponse) => {
      errorHandler.throwIf(subError);
      console.log(`>> subscription ${subResponse?.subscribe} established`);
    });
  });
}

function subscribeToIssuedSubscription() {
  client.on('subscription', (resp) => {
    if (resp.subscription !== subscriptionName) return;
    resp.files.forEach((file: File) => syncHandler.syncFile(file));
  });
}

function getSubscriptionObj(clockResponse: Obj, watchResponse?: Obj): Obj {
  return {
    expression: ['suffix', ['js', 'ts']],
    fields: ['name', 'exists'],
    since: clockResponse.clock,
    relative_root: watchResponse?.relative_path,
  };
}

export {
  client, subscriptionName, syncHandler, getSubscriptionObj,
};
export default main;
