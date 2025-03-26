export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogMessage {
  message: string;
  data?: any;
  error?: Error;
}
