import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication (phone-based)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phone: text("phone").notNull().unique(),
  name: text("name"),
  email: text("email"),
  isAdmin: boolean("is_admin").notNull().default(false),
  otpCode: text("otp_code"),
  otpExpiresAt: timestamp("otp_expires_at"),
  otpAttempts: integer("otp_attempts").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Addresses table for multi-address management
export const addresses = pgTable("addresses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  label: text("label").notNull(), // "Home", "Work", etc.
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: text("pincode").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image: text("image").notNull(),
  category: text("category").notNull(), // hoodie, tshirt, etc
  sizes: text("sizes").array().notNull(), // ["S", "M", "L", "XL"]
  inStock: boolean("in_stock").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Orders table
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  items: text("items").notNull(), // JSON stringified array of cart items
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, confirmed, packed, shipped, delivered, cancelled
  addressId: varchar("address_id").references(() => addresses.id),
  shippingAddress: text("shipping_address").notNull(), // Denormalized for history
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, completed, failed
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas with validation
export const requestOtpSchema = z.object({
  phone: z.string().regex(/^\+91\d{10}$/, "Phone must be in format +91XXXXXXXXXX"),
});

export const verifyOtpSchema = z.object({
  phone: z.string().regex(/^\+91\d{10}$/, "Phone must be in format +91XXXXXXXXXX"),
  otpCode: z.string().length(6, "OTP must be 6 digits"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional(),
});

export const insertAddressSchema = createInsertSchema(addresses, {
  label: z.string().min(1, "Label is required"),
  addressLine1: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products, {
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  image: z.string().url("Invalid image URL").or(z.string().min(1)),
  category: z.enum(["hoodie", "tshirt", "other"]),
  sizes: z.array(z.string()).min(1, "At least one size is required"),
}).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders, {
  items: z.string().min(1, "Order items are required"),
  totalAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  shippingAddress: z.string().min(10, "Shipping address is required"),
}).omit({
  id: true,
  createdAt: true,
  status: true,
  paymentStatus: true,
});

// TypeScript types
export type User = typeof users.$inferSelect;
export type RequestOtp = z.infer<typeof requestOtpSchema>;
export type VerifyOtp = z.infer<typeof verifyOtpSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;

export type Address = typeof addresses.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// Cart item type (not stored in DB, managed in frontend state)
export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
};
