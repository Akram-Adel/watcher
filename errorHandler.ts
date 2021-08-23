import { Client } from 'fb-watchman';

export default class ErrorHandler {
  private client: Client

  constructor(client: Client) {
    this.client = client;
  }

  throwIf(error?: Error | null) {
    if (error) this.throw(error);
  }

  throw(error: Error): void {
    console.log(error);

    this.client.end();
    process.exit(0);
  }
}
