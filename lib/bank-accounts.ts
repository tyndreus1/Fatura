import type { BankAccountKey, Currency } from './types'

export interface BankAccount {
  label: string
  currency: Currency
  accountName: string
  bankName: string
  branchName: string
  branchCode: string
  swiftCode: string
  accountNumber: string
  iban: string
}

export const BANK_ACCOUNTS: Record<BankAccountKey, BankAccount> = {
  akbank_eur: {
    label: 'Akbank A.Ş. — EUR (031030)',
    currency: 'EUR',
    accountName: 'Alpress Kalıpçılık Dan. Ith. Ihr. San. ve Tic. Ltd.Şti',
    bankName: 'Akbank A.S.',
    branchName: 'Seyitnizam',
    branchCode: '1349',
    swiftCode: 'AKBKTRIS',
    accountNumber: '031030',
    iban: 'TR26 0004 6013 4903 6000 0310 30',
  },
  akbank_eur2: {
    label: 'Akbank A.Ş. — EUR (0031030)',
    currency: 'EUR',
    accountName: 'Alpress Kalipcilik Dan. İth. İhr. San. ve Tic. Ltd.Şti',
    bankName: 'Akbank A.S.',
    branchName: 'Seyitnizam',
    branchCode: '1349',
    swiftCode: 'AKBKTRIS',
    accountNumber: '0031030',
    iban: 'TR76 0004 6013 4900 1000 0310 30',
  },
  akbank_usd: {
    label: 'Akbank A.Ş. — USD',
    currency: 'USD',
    accountName: 'Alpress Kalipcilik Dan. İth. İhr. San. ve Tic. Ltd.Şti',
    bankName: 'Akbank A.S.',
    branchName: 'Seyitnizam',
    branchCode: '1349',
    swiftCode: 'AKBKTRIS',
    accountNumber: '0057195',
    iban: 'TR45 0004 6013 4900 1000 0571 95',
  },
  emlak_eur: {
    label: 'Emlak Katılım Bankası — EUR',
    currency: 'EUR',
    accountName: 'Alpress Kalipcilik Dan. İth. İhr. San. ve Tic. Ltd.Şti',
    bankName: 'TURKIYE EMLAK KATILIM BANKASI',
    branchName: '',
    branchCode: '#76',
    swiftCode: 'EMLATRISXXX',
    accountNumber: '749803',
    iban: 'TR35 0021 1000 0007 4980 3001 03',
  },
}

export function getDefaultBank(currency: Currency): BankAccountKey {
  return currency === 'USD' ? 'akbank_usd' : 'akbank_eur'
}

export function getBanksForCurrency(currency: Currency): BankAccountKey[] {
  return (Object.keys(BANK_ACCOUNTS) as BankAccountKey[]).filter(
    (k) => BANK_ACCOUNTS[k].currency === currency
  )
}
