/**
 * @fileoverview Centralized error handling middleware.
 * Formats all errors into consistent JSON responses.
 * Never exposes stack traces in production.
 */

/**
 * Express error handling middleware (4-arg signature required by Express).
 * @param {Error} err - Error object
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Next middleware (required for error handler)
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  const response = {
    error: err.name || 'InternalServerError',
    message: isProduction && status === 500
      ? 'An unexpected error occurred. Please try again.'
      : err.message || 'Unknown error',
  };

  if (!isProduction && err.stack) {
    response.stack = err.stack;
  }

  res.status(status).json(response);
}

/**
 * Middleware for handling 404 not found routes.
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'NotFound',
    message: `Route ${req.method} ${req.path} not found.`,
  });
}

module.exports = { errorHandler, notFoundHandler };
