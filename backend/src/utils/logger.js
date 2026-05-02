import { config } from '../config/env.js';

const LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const currentLevel = LogLevel[config.logging.level?.toUpperCase()] || LogLevel.INFO;

const formatLog = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  let log = `[${timestamp}] [${level}] ${message}`;
  if (data) log += ` ${JSON.stringify(data)}`;
  return log;
};

export const logger = {
  error: (message, data) => {
    if (currentLevel >= LogLevel.ERROR) console.error(formatLog('ERROR', message, data));
  },
  warn: (message, data) => {
    if (currentLevel >= LogLevel.WARN) console.warn(formatLog('WARN', message, data));
  },
  info: (message, data) => {
    if (currentLevel >= LogLevel.INFO) console.log(formatLog('INFO', message, data));
  },
  debug: (message, data) => {
    if (currentLevel >= LogLevel.DEBUG) console.log(formatLog('DEBUG', message, data));
  },
};

export default logger;
