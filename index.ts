import watchman from 'fb-watchman';

import ErrorHandler from './errorHandler';
import SyncHandler, { File } from './syncHandler';

const client = new watchman.Client();
const errorHandler = new ErrorHandler(client);
const subscriptionName = 'watchman-subscription';
let syncHandler: SyncHandler;

client.capabilityCheck({ optional: [], required: ['relative_root'] }, (capabilityCheckError) => {
  errorHandler.throwIf(capabilityCheckError);

  // Initiate the watch
  client.command(['watch-project', getToWatchDirectory()], handleProjectWatch);
});

function handleProjectWatch(error?: Error | null, resp?: any) {
  errorHandler.throwIf(error);
  if ('warning' in resp) console.log('warning: ', resp.warning);
  console.log('>> watch established on ', resp.watch, ' relative_path', resp.relative_path);

  syncHandler = new SyncHandler(getToWatchDirectory());
  handleSubscription(resp.watch, resp.relative_path);
}

function getToWatchDirectory(): string {
  const dir: string | undefined = process.argv[2];
  if (!dir) errorHandler.throw(new Error('no directory provided'));
  return dir;
}

function handleSubscription(watch: any, relativePath: any) {
  issueSubscription(watch, relativePath);

  client.on('subscription', (resp) => {
    if (resp.subscription !== subscriptionName) return;
    resp.files.forEach((file: File) => syncHandler.syncFile(file));
  });
}

function issueSubscription(watch: any, relativePath: any) {
  client.command(['clock', watch], (clockError, clockResponse) => {
    errorHandler.throwIf(clockError);

    const subscribe = ['subscribe', watch, subscriptionName, getSubscriptionObj(clockResponse, relativePath)];
    client.command(subscribe, (error, resp) => {
      errorHandler.throwIf(error);
      console.log(`>> subscription ${resp.subscribe} established`);
    });
  });
}

function getSubscriptionObj(clockResponse: any, relativePath: any): { [key: string]: any; } {
  const subscriptionObj: { [key: string]: any; } = {
    expression: ['suffix', ['js', 'ts']],
    fields: ['name', 'exists'],
    since: clockResponse.clock,
  };
  if (relativePath) subscriptionObj.relative_root = relativePath;

  return subscriptionObj;
}
