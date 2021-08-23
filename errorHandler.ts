export default class ErrorHandler {
  throwIf(error?: Error | null): void {
    if (error) {
      process.exitCode = -1;
      throw error;
    }
  }

  throwCoded(code: number): void {
    process.exitCode = code;

    switch (code) {
      case 1:
      default:
        throw new Error('no/invalid directory provided');
    }
  }
}
