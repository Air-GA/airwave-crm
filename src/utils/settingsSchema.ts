
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
    connected: z.boolean(),
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
  }).optional(),
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
