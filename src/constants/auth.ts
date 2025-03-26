import { UserInfo } from '@/types/auth';

export const carrierAccounts: UserInfo[] = [
  {
    id: '991000001',
    companyId: '793647dd-b372-49d4-a48d-8d62ada95428',
    companyCode: '991000001',
    name: 'carrier_nlj',
    password: 'carrier_nlj',
    role: 'carrier',
    companyName: 'Next Logistics Japan（株）',
    address: '東京都新宿区西新宿1丁目26-2 新宿野村ビル34階',
    contactPerson: '鈴木 一郎',
    department: '運送管理部 配車管理課',
    phoneNumber: '03-1234-1234',
    email: 'carrier_nlj@gmail.com',
    bankAccount: '三菱UFJ銀行 第二西新宿支店 普通 1234567',
    giai: '991000001',
  },
  {
    id: '991000003',
    companyId: 'cooperationSystemC4001',
    companyCode: '991000002',
    name: 'carrier3',
    password: 'carrier3',
    role: 'carrier',
    companyName: 'ヤマト運輸（株）',
    address: '東京都中央区銀座2-12-16 ヤマト本社ビルA棟',
    contactPerson: '田中 次郎',
    department: '運送管理部 配車管理課',
    phoneNumber: '03-5678-5678',
    email: 'carrier_ymt@gmail.com',
    bankAccount: 'みずほ銀行 中央銀座支店 普通 7654321',
    giai: '991000002',
  },
  {
    id: '991000002',
    companyId: 'cooperationSystemC4012',
    companyCode: '991000002',
    name: 'carrier_ymt',
    password: 'carrier_ymt',
    role: 'carrier',
    companyName: 'ヤマト運輸（株）',
    address: '東京都中央区銀座2-12-16 ヤマト本社ビルA棟',
    contactPerson: '田中 次郎',
    department: '運送管理部 配車管理課',
    phoneNumber: '03-5678-5678',
    email: 'carrier_ymt@gmail.com',
    bankAccount: 'みずほ銀行 中央銀座支店 普通 7654321',
    giai: '991000002',
  },

  {
    id: '991000003',
    companyId: 'cooperationSystemC4001',
    companyCode: '991000002',
    name: 'carrier3',
    password: 'carrier3',
    role: 'carrier',
    companyName: 'ヤマト運輸（株）',
    address: '東京都中央区銀座2-12-16 ヤマト本社ビルA棟',
    contactPerson: '田中 次郎',
    department: '運送管理部 配車管理課',
    phoneNumber: '03-5678-5678',
    email: 'carrier_ymt@gmail.com',
    bankAccount: 'みずほ銀行 中央銀座支店 普通 7654321',
    giai: '991000002',
  },

  //other
  {
    id: '990000004',
    companyId: 'carrierCuong',
    companyCode: '991000001',
    name: 'carrierCuong',
    password: 'carrierCuong',
    role: 'carrier',
    companyName: 'ヤマト運輸（株）',
    address: '東京都中央区銀座2-12-16 ヤマト本社ビルA棟',
    contactPerson: '田中 次郎',
    department: '運送管理部 配車管理課',
    phoneNumber: '03-5678-5678',
    email: 'carrier_ymt@gmail.com',
    bankAccount: 'みずほ銀行 中央銀座支店 普通 7654321',
    giai: '991000002',
  },
];

export const shipperAccounts: UserInfo[] = [
  //shipper
  {
    id: '992000002',
    companyId: '793647dd-b372-49d4-a48d-8d62ada95428',
    companyCode: '992000001',
    name: 'shipper1',
    password: 'shipper1',
    role: 'shipper',
    companyName: '株式会社シッパー１',
    address: '東京都中央区京橋三丁目1番1号',
    contactPerson: '佐藤 正',
    department: '出荷管理部 荷物管理課',
    phoneNumber: '03-1122-3344',
    email: 'shipper1@gmail.com',
    bankAccount: '三井住友銀行 京橋第三支店 普通 1122334',
    giai: '992000001',
  },
  {
    id: '992000001',
    companyId: 'cooperationSystemS4001',
    companyCode: '992000002',
    name: 'shipper2',
    password: 'shipper2',
    role: 'shipper',
    companyName: '株式会社シッパー２',
    address: '東京都墨田区吾妻橋一丁目23番1号',
    contactPerson: '山本 恵美',
    department: '出荷管理部 荷物管理課',
    phoneNumber: '03-5566-7788',
    email: 'shipper2@gmail.com',
    bankAccount: 'りそな銀行 隅田支店 普通 4455667',
    giai: '992000002',
  },
  //other
  {
    id: '992000003',
    companyId: 'shipperCuong',
    companyCode: '992000001',
    name: 'shipperCuong',
    password: 'shipperCuong',
    role: 'shipper',
    companyName: '株式会社シッパー２',
    address: '東京都墨田区吾妻橋一丁目23番1号',
    contactPerson: '山本 恵美',
    department: '出荷管理部 荷物管理課',
    phoneNumber: '03-5566-7788',
    email: 'shipper2@gmail.com',
    bankAccount: 'りそな銀行 隅田支店 普通 4455667',
    giai: '992000002',
  },
];

export const carrierDebugAccounts: UserInfo[] = carrierAccounts.map((account) => ({
  ...account,
  name: `${account.name}_debug`,
  password: `${account.password}_debug`,
  debug: 'true',
}));

export const shipperDebugAccounts: UserInfo[] = shipperAccounts.map((account) => ({
  ...account,
  name: `${account.name}_debug`,
  password: `${account.password}_debug`,
  debug: 'true',
}));

export const mockAccount: UserInfo[] = [
  //carrier
  ...carrierAccounts,
  ...carrierDebugAccounts,
  //shipper
  ...shipperAccounts,
  ...shipperDebugAccounts,
];

export const account = {
  carrier: {
    operatorAccountId: 'testaccount_005@example.com',
    accountPassword: 'Test@User_005',
  },
  shipper: {
    operatorAccountId: 'testaccount_ap109@example.com',
    accountPassword: 'd8PmVa%R',
  },
};
