
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
    syncInventory: z.boolean().default(true),
    syncCustomers: z.boolean().default(true),
    syncInvoices: z.boolean().default(true),
    enableAutoPay: z.boolean().default(false),
  }),
  googleMaps: z.object({
    connected: z.boolean(),
    apiKey: z.string().min(5, { message: "API Key is required" }).optional().or(z.literal("")),
  }),
  smsProvider: z.object({
    connected: z.boolean(),
    apiKey: z.string().optional().or(z.literal("")),
  }),
});
