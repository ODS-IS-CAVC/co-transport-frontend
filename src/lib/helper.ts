import { StringObject } from '@/types/app';

export const handleFormatNumberInput = (numberString: string) => {
  if (!numberString) return '';

  const convertFullWidthToHalfWidth = (value: string): string => {
    return value.replace(/[\uFF10-\uFF19]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0));
  };

  const formatNumber = (value: string) => {
    const number = value.replace(/,/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const halfWidthValue = convertFullWidthToHalfWidth(numberString);

  const formattedValue = formatNumber(halfWidthValue);

  return formattedValue;
};

export const handleFormatNumberToCurrency = (value: number) => {
  // Check if the value is negative
  const isNegative = value < 0;
  // Use the absolute value for formatting
  const absoluteValue = Math.abs(value);

  // Check if the absolute value is an integer
  if (Number.isInteger(absoluteValue)) {
    // Format the integer part with commas
    return (isNegative ? '-' : '') + absoluteValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  } else {
    // Convert the number to a string with fixed decimal places
    const formattedValue = absoluteValue.toFixed(2);

    // Split the integer and decimal parts
    const [integerPart, decimalPart] = formattedValue.split('.');

    // Format the integer part with commas
    const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Combine the formatted integer part with the decimal part
    return (isNegative ? '-' : '') + `${formattedIntegerPart}.${decimalPart}`;
  }
};

export const generateUniqueId = () => {
  const timestamp = Date.now().toString(36);
  const randomString = Math.random().toString(36).substring(2, 5);
  const newId = `${timestamp}-${randomString}`;
  return newId;
};

export const deepMergeWithConcat = (defaultObj: StringObject, newObj: StringObject): StringObject => {
  const result: StringObject = {};

  for (const key of new Set([...Object.keys(defaultObj), ...Object.keys(newObj)])) {
    const defaultVal = defaultObj[key] || '';
    const newVal = newObj[key] || '';

    // Concatenate, split into words, deduplicate, and join back into a string
    result[key] = [...new Set((defaultVal + ' ' + newVal).trim().split(/\s+/))].join(' ');
  }

  return result;
};

export const differenceExpired = (token: string) => {
  try {
    // Split the payload part
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) {
      throw new Error('Invalid token format');
    }

    // Decode Base64
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);

    // Get the current time
    const currentTime = Date.now();
    // Calculate the expiration time
    const expirationTime = payload.exp * 1000;

    // Calculate the time difference
    const timeDifference = expirationTime - currentTime;
    // Convert milliseconds to seconds
    const secondsDifference = Math.floor(timeDifference / 1000);

    // Return the time difference in seconds
    return secondsDifference;
  } catch (error) {
    return -1; // Invalid token returns -1
  }
};

export const convertDecimalToTime = (decimal: number): string => {
  if (decimal % 1 === 0) {
    return `${decimal}時間`;
  }
  const hours = Math.floor(decimal);
  const minutes = Math.round((decimal - hours) * 60);
  return `${hours}時間${minutes}分`;
};

export const debounce = (func: Function, delay: number) => {
  let timeoutId: number;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      func(...args);
    }, delay);
  };
};

// format date with week day japanese with format 2024年11月01日(金)
export function formatDateWithWeekDayJapanese(date: Date): string {
  if (!date) return new Date().toISOString();

  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(date);
}
