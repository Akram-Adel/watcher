class ErrorHandler {
  throwIf(error?: Error | null): void {
    if (error) {
      process.exitCode = -1;
      throw error;
    }
  }

  throwCoded(code: number): never {
    process.exitCode = code;

    switch (code) {
      case 1:
      default:
        throw new Error('no/invalid directory provided');
    }
  }
}

const errorHander = new ErrorHandler();
export default errorHander;
