
import * as z from "zod";

export const companyFormSchema = z.object({
  companyName: z.string().min(2, { message: "Company name is required" }),
  companyEmail: z.string().email({ message: "Invalid email address" }),
  companyPhone: z.string().min(7, { message: "Valid phone number required" }),
  companyAddress: z.string().min(5, { message: "Address is required" }),
  companyDescription: z.string().optional(),
  is24Hours: z.boolean().default(true),
  emergency24h: z.boolean().default(true),
});

export const userFormSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().min(7, { message: "Valid phone number required" }),
  timezone: z.string(),
});

export const integrationSchema = z.object({
  quickbooks: z.object({
    connected: z.boolean().default(false),
    apiKey: z.string().optional(),
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    environment: z.enum(["sandbox", "production"]).default("sandbox"),
    redirectUri: z.string().optional(),
    companyId: z.string().optional(),
    autoSync: z.boolean().default(true),
    autoSyncInterval: z.number().default(300000), // 5 minutes in milliseconds
    liveSyncEnabled: z.boolean().default(true),
    syncInventory: z.boolean().default(true),
    syncCustomers: z.boolean().default(true),
    syncInvoices: z.boolean().default(true),
    enableAutoPay: z.boolean().default(false),
    // Adding timesheet sync settings
    syncTimesheets: z.boolean().default(true),
    payrollIntegration: z.boolean().default(true),
    overtimeThreshold: z.number().default(40), // Hours per week
    payrollCycleStart: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]).default("thursday"),
    payrollCycleEnd: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]).default("wednesday"),
  }),
  googleMaps: z.object({
    connected: z.boolean(),
    apiKey: z.string().min(5, { message: "API Key is required" }).optional().or(z.literal("")),
  }),
  smsProvider: z.object({
    connected: z.boolean(),
    apiKey: z.string().optional().or(z.literal("")),
  }),
  // Adding Profit Rhino API integration
  profitRhino: z.object({
    connected: z.boolean().default(false),
    apiKey: z.string().optional(),
    apiSecret: z.string().optional(),
    environment: z.enum(["sandbox", "production"]).default("sandbox"),
    baseUrl: z.string().optional(),
    autoSync: z.boolean().default(true),
    syncInterval: z.number().default(3600000), // 1 hour in milliseconds
    syncInventory: z.boolean().default(true),
    syncPricing: z.boolean().default(true),
    markupPercentage: z.number().default(30), // Default markup percentage
    useCompanyMarkups: z.boolean().default(true),
    useDefaultMaterialsCost: z.boolean().default(false),
    useCustomPricebook: z.boolean().default(false),
    pricebookId: z.string().optional(),
  }),
});

// Define the UserRole type to include all roles in one place
export const userRoles = [
  "admin",
  "manager",
  "csr",
  "tech",
  "technician",
  "sales",
  "hr",
  "customer",
  "user"
] as const;

export type UserRole = typeof userRoles[number];

export const rolePermissionSchema = z.object({
  role: z.enum(userRoles),
  permissions: z.array(z.string()),
  description: z.string(),
});

export type RolePermission = z.infer<typeof rolePermissionSchema>;
