/**
 * Performance monitoring middleware
 * Tracks response times and API usage metrics
 */

import os from 'os';

/**
 * Response time middleware
 * Adds response time header to all requests
 */
export const responseTime = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    // Log slow requests (>500ms)
    if (duration > 500) {
      console.warn(`🐌 Slow request: ${req.method} ${req.originalUrl} - ${duration}ms`);
    }
  });

  next();
};

/**
 * System health monitoring endpoint
 * Returns server health and performance metrics
 */
export const getSystemHealth = (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024),
    },
    system: {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: Math.round(os.totalmem() / 1024 / 1024 / 1024),
      freeMemory: Math.round(os.freemem() / 1024 / 1024 / 1024),
    },
    version: process.version,
    environment: process.env.NODE_ENV || 'development',
  };

  res.status(200).json(health);
};

/**
 * API metrics middleware
 * Tracks API usage patterns (basic implementation)
 */
const metrics = {
  requests: 0,
  responses: {
    '2xx': 0,
    '4xx': 0,
    '5xx': 0,
  },
  endpoints: {},
};

export const trackMetrics = (req, res, next) => {
  metrics.requests++;

  const endpoint = `${req.method} ${req.route?.path || req.path}`;
  metrics.endpoints[endpoint] = (metrics.endpoints[endpoint] || 0) + 1;

  res.on('finish', () => {
    const statusCode = res.statusCode;
    if (statusCode >= 200 && statusCode < 300) {
      metrics.responses['2xx']++;
    } else if (statusCode >= 400 && statusCode < 500) {
      metrics.responses['4xx']++;
    } else if (statusCode >= 500) {
      metrics.responses['5xx']++;
    }
  });

  next();
};

/**
 * Get API metrics
 * Returns usage statistics
 */
export const getMetrics = (req, res) => {
  res.status(200).json({
    ...metrics,
    timestamp: new Date().toISOString(),
  });
};