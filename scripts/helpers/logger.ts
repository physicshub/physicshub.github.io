import { EventEmitter } from 'node:events';

export type LogLevel = 'info' | 'error' | 'debug';
const loggerEmitter = new EventEmitter({
  captureRejections: true,
});

// Key for log events
export const LOG_EVENT_KEY = 'physicshub-logger-event';

// Mapping log levels to numeric values for comparison
const logLevelValues: { [Key in LogLevel]: number } = {
  debug: 1,
  info: 2,
  error: 3,
};

export type LogEvent = {
  level: LogLevel;
  message: string;
};

/**
 * Create a logger that emits log events.
 */
const createLogger = () => {
  const emitLogEvent = (level: LogLevel, message: unknown) => {
    const timestamp = new Date().toISOString();
    const logEvent: LogEvent = {
      level,
      message: `[${level.toUpperCase()}] ${timestamp} - ${message}`,
    };
    loggerEmitter.emit(LOG_EVENT_KEY, logEvent);
  };

  return {
    info: (message: unknown) => emitLogEvent('info', message),
    error: (message: unknown) => emitLogEvent('error', message),
    debug: (message: unknown) => emitLogEvent('debug', message),
  };
};

/**
 * Create a logging observer that listens to log events and calls a callback function when a log event is emitted.
 */
export const createLoggingObserver = (
  minLogLevel: LogLevel,
  callback: (event: LogEvent) => void
): EventEmitter => {
  const minLogLevelValue = logLevelValues[minLogLevel];

  return loggerEmitter.on(LOG_EVENT_KEY, (event: LogEvent) => {
    if (logLevelValues[event.level] >= minLogLevelValue) {
      callback(event);
    }
  });
};

export const logger = createLogger();
