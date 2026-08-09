export interface LicenseStatus {
  success: boolean;
  activated: boolean;
  machineId: string;
  trialExpired: boolean;
  trialDaysLeft: number | null;
  trialDays?: number;
  invalidStoredLicense?: boolean;
  licenseType?: 'permanent' | 'yearly';
  expiresAt?: string | null;
  message?: string;
  error?: string;
}

export interface ActivationResult {
  success: boolean;
  licenseType?: 'permanent' | 'yearly';
  expiresAt?: string | null;
  message?: string;
}

declare global {
  interface Window {
    licenseAPI?: {
      getStatus: () => Promise<LicenseStatus>;
      activate: (code: string) => Promise<ActivationResult>;
      copyMachineId: (text: string) => Promise<{ success: boolean }>;
    };
  }
}

export {};
