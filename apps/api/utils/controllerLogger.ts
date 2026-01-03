import { Request } from 'express';
import { logger } from './winstonLogger';

interface LogInfo {
  controller: string;
  action: string;
  userId?: string;
  params?: any;
  query?: any;
  body?: any;
  error?: any;
  result?: any;
  statusCode?: number;
}

/**
 * Standardized logging function for controllers
 * @param req Express request object
 * @param logInfo Information to log
 */
export const logController = (req: Request, logInfo: LogInfo): void => {
  const { controller, action, error, result, statusCode } = logInfo;
  
  // Extract user ID if available
  const userId = logInfo.userId || (req.user && req.user._id) || 'anonymous';
  
  // Create a standardized log object
  const logObject = {
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || Math.random().toString(36).substring(2, 15),
    controller,
    action,
    userId,
    method: req.method,
    path: req.path,
    params: logInfo.params || req.params,
    query: logInfo.query || req.query,
    // Only include body in debug logs or on error to avoid logging sensitive data
    ...(error || process.env.NODE_ENV === 'development' ? { body: logInfo.body || req.body } : {}),
    statusCode,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  };

  if (error) {
    // Log errors with the error details
    logger.error(`${controller}:${action} failed`, {
      ...logObject,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code,
      },
    });
  } else {
    // Log successful operations with minimal result info
    logger.info(`${controller}:${action} succeeded`, {
      ...logObject,
      result: result ? { success: true } : undefined,
    });
    
    // Log detailed result only in debug mode
    if (result && process.env.NODE_ENV === 'development') {
      logger.debug(`${controller}:${action} result details`, {
        ...logObject,
        result,
      });
    }
  }
};