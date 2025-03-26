export interface UserInfo {
  id: string;
  companyId: string;
  companyCode: string;
  name: string;
  password: string;
  role: string;
  debug?: string;
  companyName: string;
  address: string;
  contactPerson: string;
  department: string;
  phoneNumber: string;
  email: string;
  bankAccount: string;
  giai: string;
}

export interface AuthLogin {
  operatorAccountId: string;
  accountPassword: string;
}

export interface AuthResponse {
  code: string;
  message: string;
  detail: string;
  accessToken: string;
  refreshToken: string;
}
