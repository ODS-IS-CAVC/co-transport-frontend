import { MESSAGES } from './messages';

type MessageParams = {
  [key: string]: string | number;
};

export const gTxt = (path: string, params?: MessageParams): string => {
  const parts = path.split('.');

  let result: any = MESSAGES;
  for (const part of parts) {
    result = result[part];
    if (result === undefined) {
      return path;
    }
  }

  if (typeof result !== 'string') {
    return path;
  }

  if (params) {
    return Object.entries(params).reduce((str, [key, value]) => {
      return str.replace(new RegExp(`{${key}}`, 'g'), String(value));
    }, result);
  }

  return result;
};
