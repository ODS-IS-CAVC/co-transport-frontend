import http, { CustomOptions } from '@/lib/http';

const BASE_URL = process.env.NEXT_PUBLIC_API_TRANSACTION;

export class TransactionApi {
  constructor(private token?: string) {
    this.token = token;
  }

  get<Response>(url: string, options?: Omit<CustomOptions, 'body'>) {
    const headers: Record<string, string> = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    return http.get<Response>(url, {
      baseUrl: BASE_URL,
      headers: headers,
      ...options,
    });
  }

  post<Response>(url: string, body?: any, options?: Omit<CustomOptions, 'body'>) {
    return http.post<Response>(url, body, {
      baseUrl: BASE_URL,
      headers: {
        Authorization: `Bearer ${this.token || ''}`,
      },
      ...options,
    });
  }

  put<Response>(url: string, body?: any, options?: Omit<CustomOptions, 'body'>) {
    return http.put<Response>(url, body, {
      baseUrl: BASE_URL,
      headers: {
        Authorization: `Bearer ${this.token || ''}`,
      },
      ...options,
    });
  }

  delete<Response>(url: string, options?: Omit<CustomOptions, 'body'>) {
    return http.delete<Response>(url, {
      baseUrl: BASE_URL,
      headers: {
        Authorization: `Bearer ${this.token || ''}`,
      },
      ...options,
    });
  }
}
