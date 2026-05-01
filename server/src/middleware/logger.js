/**
 * Logger middleware for tracking HTTP requests
 * Helps with debugging and monitoring in production
 */

/**
 * Format timestamp for logs
 */
const getTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Request logger middleware
 * Logs incoming requests and response status
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request
  console.log(`[${getTimestamp()}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);

  // Capture response
  const originalSend = res.send;

  res.send = function (data) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const statusColor =
      statusCode >= 200 && statusCode < 300
        ? '\x1b[32m' // Green
        : statusCode >= 300 && statusCode < 400
          ? '\x1b[36m' // Cyan
          : statusCode >= 400 && statusCode < 500
            ? '\x1b[33m' // Yellow
            : '\x1b[31m'; // Red

    console.log(
      `[${getTimestamp()}] ${statusColor}${statusCode}\x1b[0m ${req.method} ${req.originalUrl} - ${duration}ms`
    );

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Error logger middleware
 * Logs errors with full stack trace
 */
export const errorLogger = (err, req, res, next) => {
  console.error(`[${getTimestamp()}] ERROR:`, {
    message: err.message,
    status: err.status || 500,
    path: req.originalUrl,
    method: req.method,
    stack: err.stack,
  });

  next(err);
};
