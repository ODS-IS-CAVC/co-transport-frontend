import http from '@/lib/http';
import { AuthLogin, AuthResponse } from '@/types/auth';

const AUTH_BASE_URL = process.env.NEXT_PUBLIC_API_AUTH;

const LOGIN_URL = '/auth/login';

export const authenticationApi = {
  login: async (data: AuthLogin) => {
    return http.post<AuthResponse>(LOGIN_URL, data, {
      baseUrl: AUTH_BASE_URL,
    });
  },

  refreshTokens: async (refreshToken: string) => {
    console.log('refreshToken', refreshToken);
    const formData = new FormData();
    formData.append('refreshToken', refreshToken);
    return http.post<AuthResponse>('/auth/refresh', formData, { baseUrl: AUTH_BASE_URL });
  },
};
