import { HTTP_INTERNAL_SERVER_ERROR, HTTP_UNAUTHORIZED, HTTP_UNPROCESSABLE_ENTITY } from '@/constants/apiStatus';
import {
  KEY_COOKIE_COMPANY_CODE,
  KEY_COOKIE_COMPANY_ID,
  KEY_COOKIE_DEBUG,
  KEY_COOKIE_IS_NOT_IX,
  KEY_COOKIE_TOKEN,
  KEY_COOKIE_USER_ROLE,
} from '@/constants/keyStorage';
import { getCookie } from '@/lib/utils';
import { Logger } from '@/utils/logger';

// ... rest of the code

// eslint-disable-next-line no-undef
export type CustomOptions = Omit<RequestInit, 'method'> & {
  baseUrl?: string;
};

export class HttpError extends Error {
  status: number;
  payload: Record<string, any>;

  constructor(status: number, payload: Record<string, any>) {
    super(`HttpError - Status: ${status}, Payload: ${JSON.stringify(payload)}`);
    this.status = status;
    this.payload = payload;

    // Ensure proper prototype chain for built-in classes
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toString() {
    return `HttpError - Status: ${this.status}, Payload: ${JSON.stringify(this.payload)}`;
  }
}

export class EntityError extends HttpError {
  constructor(payload: Record<string, any>) {
    super(HTTP_UNPROCESSABLE_ENTITY, payload);
  }
}

export const isClient = () => typeof window !== 'undefined';

const createFullUrl = (url: string, baseUrl?: string): string => {
  const base = baseUrl || process.env.NEXT_PUBLIC_API_SERVICE || '';
  return url.startsWith('/') ? `${base}${url}` : `${base}/${url}`;
};

const request = async <Response>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  options?: CustomOptions,
): Promise<Response> => {
  const fullUrl = createFullUrl(url, options?.baseUrl);
  try {
    const body =
      options?.body instanceof FormData ? options.body : options?.body ? JSON.stringify(options.body) : undefined;

    const headers: Record<string, string> = {
      ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...((options?.headers as Record<string, string>) || {}),
    };

    if (isClient()) {
      const userToken = getCookie(KEY_COOKIE_TOKEN) as string | null;
      if (userToken) headers.Authorization = `Bearer ${userToken}`;
      const companyCode = getCookie(KEY_COOKIE_COMPANY_CODE) as string | null;
      if (companyCode) headers['operator-code'] = companyCode;
      const companyId = getCookie(KEY_COOKIE_COMPANY_ID) as string | null;
      if (companyId) headers['operator-id'] = companyId;
      const debug = getCookie(KEY_COOKIE_DEBUG) as string | null;
      if (debug) headers['debug'] = debug;
      const isNotIx = getCookie(KEY_COOKIE_IS_NOT_IX) as string | null;
      if (isNotIx) headers['is-not-ix'] = isNotIx;
      const userRole = getCookie(KEY_COOKIE_USER_ROLE) as string | null;
      if (userRole) headers['role'] = userRole;
    } else {
      const { cookies } = await import('next/headers');

      const companyCode = cookies().get(KEY_COOKIE_COMPANY_CODE)?.value;
      if (companyCode) headers['operator-code'] = companyCode;
      const companyId = cookies().get(KEY_COOKIE_COMPANY_ID)?.value;
      if (companyId) headers['operator-id'] = companyId;
      const debug = cookies().get(KEY_COOKIE_DEBUG)?.value;
      if (debug) headers['debug'] = debug;
      const isNotIx = cookies().get(KEY_COOKIE_IS_NOT_IX)?.value;
      if (isNotIx) headers['is-not-ix'] = isNotIx;
      const userRole = cookies().get(KEY_COOKIE_USER_ROLE)?.value;
      if (userRole) headers['role'] = userRole;
    }

    const response = await fetch(fullUrl, {
      ...options,
      headers,
      body,
      method,
    });

    if (!response.ok) {
      const responseData = await response.json().catch(() => ({}));
      const errorPayload = {
        url: fullUrl,
        body,
        status: response.status || HTTP_INTERNAL_SERVER_ERROR,
        responseData,
      };

      // if (process.env.NEXT_PUBLIC_SHOW_LOGGER !== 'false') {
      //   console.error('Error payload:', errorPayload);
      //   return errorPayload as Response;
      // }

      if (response.status === HTTP_UNPROCESSABLE_ENTITY) {
        throw new EntityError(errorPayload);
      }

      if (response.status === HTTP_UNAUTHORIZED) {
        throw new HttpError(HTTP_UNAUTHORIZED, { message: 'Unauthorized' });
      }

      throw new HttpError(response.status, errorPayload);
    }

    const dataResponse = await response.json().catch(() => ({}));

    return dataResponse;
  } catch (error) {
    await Logger.error({
      message: `HTTP Request Error: ${method} ${fullUrl}`,
      data: {
        error,
      },
    });

    if (process.env.NEXT_PUBLIC_SHOW_LOGGER === 'false') {
      return error as Response;
    }

    throw error;
  }
};

const http = {
  get<Response>(url: string, options?: Omit<CustomOptions, 'body'>) {
    return request<Response>('GET', url, options);
  },
  post<Response>(url: string, body: any, options?: Omit<CustomOptions, 'body'>) {
    return request<Response>('POST', url, { ...options, body });
  },
  put<Response>(url: string, body: any, options?: Omit<CustomOptions, 'body'>) {
    return request<Response>('PUT', url, { ...options, body });
  },
  delete<Response>(url: string, options?: Omit<CustomOptions, 'body'>) {
    return request<Response>('DELETE', url, options);
  },
};

export default http;
