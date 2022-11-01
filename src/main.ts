import watchman from 'fb-watchman';

import { File } from '../typings.d';

import { SyncHandlerBase, SingleSyncHandler, LinkedSyncHandler } from './syncHandler';
import getLinkedProjects from './resolvers/getLinkedProjects';
import getProject from './resolvers/getProject';
import { getInputWithFlag } from './resolvers/utils';

export const client = new watchman.Client();
export const subscriptionName = 'watcher-subscription';
let syncHandler: SyncHandlerBase;

export default function main(): void {
  const capabilityChecks = ['relative_root', 'suffix-set'];
  client.capabilityCheck({ optional: [], required: capabilityChecks }, (error) => {
    throwIf(error);

    if (getInputWithFlag('link')) {
      syncHandler = new LinkedSyncHandler();
      getLinkedProjects().forEach((project) => issueWatchCommand(project));
    } else {
      syncHandler = new SingleSyncHandler();
      issueWatchCommand();
    }

    subscribeToWatchClient();
  });
}

function issueWatchCommand(project: string = getProject()) {
  client.command(['watch-project', project], handleWatchCommand);
}

function subscribeToWatchClient() {
  client.on('subscription', (resp) => {
    if (resp.subscription !== subscriptionName) return;
    resp.files.forEach((file: File) => syncHandler.syncFile(file, resp.root));
  });
}

function handleWatchCommand(error?: Error | null, resp?: any) {
  throwIf(error);

  /* istanbul ignore next */
  if ('warning' in resp) mainLog('WARNING', resp.warning);
  mainLog('SUCESS', 'watch established on', resp.watch, 'relative_path', resp.relative_path);

  issueClockedSubscription(resp);
}

function issueClockedSubscription(resp?: any) {
  client.command(['clock', resp.watch], (clockError?: Error | null, clockResponse?: any) => {
    throwIf(clockError);

    const subscribeCommand = [
      'subscribe',
      resp.watch,
      subscriptionName,
      getSubscriptionObj(clockResponse, resp),
    ];

    client.command(subscribeCommand, (subError?: Error | null, subResponse?: any) => {
      throwIf(subError);

      /* istanbul ignore next */
      mainLog('SUCESS', 'subscription', subResponse?.subscribe, 'established');
    });
  });
}

type Obj = { [key: string]: any }
export function getSubscriptionObj(clockResponse: Obj, watchResponse?: Obj): Obj {
  return {
    expression: ['suffix', ['js', 'jsx', 'ts', 'tsx']],
    fields: ['name', 'exists'],
    since: clockResponse.clock,
    relative_root: watchResponse?.relative_path,
  };
}

function throwIf(error?: Error | null): void | never {
  if (error) throw error;
}

/* istanbul ignore next */
function mainLog(type: 'SUCESS' | 'WARNING', ...log: Array<any>) {
  if (process.env.NODE_ENV === 'test') return;

  const decoration = (type === 'SUCESS') ? '\x1b[42m\x1b[30m'
    : '\x1b[45m\x1b[30m';
  console.log(decoration, type, '\x1b[0m', ...log);
}
