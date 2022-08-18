
export class HttpException extends Error {
  constructor(status = 500, errorKey = "DEFAULT_ERROR", message = 'Http Exception') {
    super(message);

    this.status = status;
    this.message = message;
    this.errorKey = errorKey;
  }

  toString() {
    /* istanbul ignore next */
    return `Http Exception (${this.status}): ${this.message}`;
  }
}

/**
 * Express middleware to handle HttpException errors
 * Other types of errors will be passed to the next handler
 * @param {*} err Error to handle, only HttpException will be processed
 */
export const httpErrorHandler = (err, req, res, next) => {
  // Delegate to default Express error handler if headers are already sent 
  if (res.headersSent) {
    /* istanbul ignore next */
    return next(err);
  }

  if (err instanceof HttpException) {
    return res.status(err.status).send({ errorKey: err.errorKey, error: err.message });
  }

  /* istanbul ignore next */
  next(err);
};
