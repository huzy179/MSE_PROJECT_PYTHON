import { config } from '../config/env';

export const logger = {
  log: (...args: any[]) => {
    if (config.enableDebugLogs) {
      console.log(...args);
    }
  },
  
  error: (...args: any[]) => {
    console.error(...args);
  },
  
  warn: (...args: any[]) => {
    console.warn(...args);
  },
  
  info: (...args: any[]) => {
    if (config.enableDebugLogs) {
      console.info(...args);
    }
  },
  
  debug: (...args: any[]) => {
    if (config.enableDebugLogs) {
      console.debug(...args);
    }
  }
};
