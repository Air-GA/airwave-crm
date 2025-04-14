
/**
 * Utility functions for managing settings in local storage
 */

export interface CompanySettings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  companyDescription: string;
  businessHours: {
    is24Hours: boolean;
    schedule?: Record<string, { open: string; close: string }>;
  };
  preferences: {
    darkMode: boolean;
    compactView: boolean;
    emergency24h: boolean;
  };
}

export interface IntegrationSettings {
  googleMaps: {
    connected: boolean;
    apiKey?: string;
  };
  smsProvider: {
    connected: boolean;
    apiKey?: string;
  };
  profitRhino?: {
    connected: boolean;
    apiKey?: string;
    apiSecret?: string;
    environment: "sandbox" | "production";
    baseUrl?: string;
    autoSync: boolean;
    syncInterval: number;
    syncInventory: boolean;
    syncPricing: boolean;
    markupPercentage: number;
    useCompanyMarkups: boolean;
    useDefaultMaterialsCost: boolean;
    useCustomPricebook: boolean;
    pricebookId?: string;
  };
}

export interface UserSettings {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  timezone: string;
}

// Default settings
export const defaultCompanySettings: CompanySettings = {
  companyName: "Air Georgia Home Comfort Systems",
  companyEmail: "service@air-ga.net",
  companyPhone: "(470) 800-9002",
  companyAddress: "910 E Spring St, Monroe, GA 30565",
  companyDescription: "Air Georgia Home Comfort Systems is a leading HVAC service provider in the Monroe area, offering installation, maintenance, and repair services for residential and commercial customers.",
  businessHours: {
    is24Hours: true,
    schedule: {
      Monday: { open: "09:00", close: "17:00" },
      Tuesday: { open: "09:00", close: "17:00" },
      Wednesday: { open: "09:00", close: "17:00" },
      Thursday: { open: "09:00", close: "17:00" },
      Friday: { open: "09:00", close: "17:00" },
      Saturday: { open: "10:00", close: "15:00" },
      Sunday: { open: "closed", close: "closed" },
    }
  },
  preferences: {
    darkMode: false,
    compactView: false,
    emergency24h: true,
  }
};

export const defaultIntegrationSettings: IntegrationSettings = {
  googleMaps: {
    connected: false,
    apiKey: "",
  },
  smsProvider: {
    connected: false,
    apiKey: "",
  },
  profitRhino: {
    connected: false,
    apiKey: "",
    apiSecret: "",
    environment: "sandbox",
    baseUrl: "",
    autoSync: true,
    syncInterval: 3600000, // 1 hour in milliseconds
    syncInventory: true,
    syncPricing: true,
    markupPercentage: 30, // Default markup percentage
    useCompanyMarkups: true,
    useDefaultMaterialsCost: false,
    useCustomPricebook: false,
    pricebookId: "",
  }
};

export const defaultUserSettings: UserSettings = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@air-ga.com",
  phone: "(404) 555-5678",
  timezone: "america_new_york",
};

// Save settings to local storage
export const saveCompanySettings = (settings: CompanySettings) => {
  localStorage.setItem("companySettings", JSON.stringify(settings));
};

export const saveIntegrationSettings = (settings: IntegrationSettings) => {
  localStorage.setItem("integrationSettings", JSON.stringify(settings));
};

export const saveUserSettings = (settings: UserSettings) => {
  localStorage.setItem("userSettings", JSON.stringify(settings));
};

// Load settings from local storage
export const getCompanySettings = (): CompanySettings => {
  const stored = localStorage.getItem("companySettings");
  return stored ? JSON.parse(stored) : defaultCompanySettings;
};

export const getIntegrationSettings = (): IntegrationSettings => {
  const stored = localStorage.getItem("integrationSettings");
  return stored ? JSON.parse(stored) : defaultIntegrationSettings;
};

export const getUserSettings = (): UserSettings => {
  const stored = localStorage.getItem("userSettings");
  return stored ? JSON.parse(stored) : defaultUserSettings;
};
