import { z } from "zod";

export const deliverySlotSchema = z.enum([
  "today_lunch",
  "today_dinner",
  "tomorrow_lunch",
  "tomorrow_dinner",
]);

export const cartItemSchema = z.object({
  menu_item_id: z.uuid(),
  qty: z.number().int().min(1).max(50),
});

export const createOrderSchema = z.object({
  items: z.array(cartItemSchema).min(1, "Cart is empty").max(20),
  note: z
    .string()
    .trim()
    .max(500, "Note must be 500 characters or fewer")
    .optional()
    .default(""),
  slot: deliverySlotSchema,
});

export const checkoutDetailsSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Your name is required")
    .max(80, "Name must be at most 80 characters"),
  building_id: z.uuid("Select your tower"),
  flat_number: z
    .string()
    .trim()
    .min(1, "Flat number is required")
    .max(16, "Flat number must be at most 16 characters"),
  landmark: z
    .string()
    .trim()
    .max(120, "Landmark must be at most 120 characters")
    .optional()
    .default(""),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CheckoutDetailsInput = z.infer<typeof checkoutDetailsSchema>;
