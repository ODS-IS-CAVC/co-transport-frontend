import { LogLevel, LogMessage } from '@/types/logger';

export class Logger {
  private static readonly baseUrl: string =
    typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  private static stringify(data: unknown): string {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to stringify data:', error);
      return String(data);
    }
  }

  private static async sendLog(level: LogLevel, logMessage: LogMessage): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: this.stringify({ level, ...logMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to send log:', error);
      }
    }
  }

  static async info(params: LogMessage): Promise<void> {
    await this.sendLog('info', params);
  }

  static async warn(params: LogMessage): Promise<void> {
    await this.sendLog('warn', params);
  }

  static async error(params: LogMessage): Promise<void> {
    await this.sendLog('error', params);
  }

  static async debug(params: LogMessage): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      await this.sendLog('debug', params);
    }
  }
}
