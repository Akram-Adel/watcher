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
        throw new Error('no/invalid directory provided');
      case 2:
        throw new Error('invalid project configurations');
      case 3:
        throw new Error('no/invalid project package.json');

      case 0:
      default:
        throw new Error('internal script error');
    }
  }
}

const errorHandler = new ErrorHandler();
export default errorHandler;
