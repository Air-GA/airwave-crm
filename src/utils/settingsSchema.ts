
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
    connected: z.boolean(),
    apiKey: z.string().optional(),
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
