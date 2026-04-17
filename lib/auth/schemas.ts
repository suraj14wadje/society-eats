import { z } from "zod";

export const PHONE_COUNTRY_CODE = "+91";
const TEN_DIGITS = /^[0-9]{10}$/;

export const phoneDigitsSchema = z
  .string()
  .trim()
  .regex(TEN_DIGITS, "Enter a 10-digit mobile number");

export const phoneE164Schema = z
  .string()
  .regex(/^\+91[0-9]{10}$/, "Invalid Indian phone number");

export function toE164(digits: string): string {
  return `${PHONE_COUNTRY_CODE}${digits}`;
}

export const otpSchema = z
  .string()
  .trim()
  .regex(/^[0-9]{6}$/, "Enter the 6-digit code");

export const profileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(80, "Full name must be at most 80 characters"),
  building_id: z.uuid("Select a building"),
  flat_number: z
    .string()
    .trim()
    .min(1, "Flat number is required")
    .max(16, "Flat number must be at most 16 characters"),
});

export type ProfileInput = z.infer<typeof profileSchema>;
