'use server';

import { promises as fs } from 'fs';
import path from 'path';

import dayjs from '@/lib/dayjs';
import { LogLevel, LogMessage } from '@/types/logger';

const MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB

async function getLogDir() {
  return path.join(process.cwd(), 'logs');
}

async function ensureLogDir(logDir: string) {
  try {
    await fs.access(logDir);
  } catch {
    await fs.mkdir(logDir, { recursive: true });
  }
}

async function getLogFile(level: LogLevel) {
  const logDir = await getLogDir();
  const date = new Date().toISOString().split('T')[0];
  return path.join(logDir, `${level}-${date}.log`);
}

function formatMessage({ message, data, error }: LogMessage): string {
  const timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
  let logMessage = `[${timestamp}] ${message}`;

  if (data) {
    logMessage += `\nData: ${JSON.stringify(data, null, 2)}`;
  }

  if (error) {
    logMessage += `\nError: ${error.message}`;
    if (error.stack) {
      logMessage += `\nStack: ${error.stack}`;
    }
  }

  return logMessage + '\n';
}

export async function serverLog(level: LogLevel, logMessage: LogMessage) {
  try {
    const formattedMessage = formatMessage(logMessage);
    const logDir = await getLogDir();
    await ensureLogDir(logDir);
    const logFile = await getLogFile(level);

    // Rotate log if needed
    try {
      const stats = await fs.stat(logFile);
      if (stats.size > MAX_LOG_SIZE) {
        const backupFile = `${logFile}.${Date.now()}.backup`;
        await fs.rename(logFile, backupFile);
      }
    } catch (error) {
      // File doesn't exist yet, that's fine
    }

    // Append to log file
    await fs.appendFile(logFile, formattedMessage);
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}
