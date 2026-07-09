import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  decimal,
  pgEnum,
} from "drizzle-orm/pg-core";

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "processing",
  "out_for_delivery",
  "delivered",
  "cancelled",
]);

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  image: text("image"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image: text("image"),
  images: text("images"),
  categoryId: integer("category_id")
    .references(() => categories.id)
    .notNull(),
  stock: integer("stock").default(0).notNull(),
  unit: varchar("unit", { length: 50 }).default("packet").notNull(),
  weight: varchar("weight", { length: 50 }),
  sizes: text("sizes"),
  active: boolean("active").default(true).notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  phone: varchar("phone", { length: 20 }).default("").notNull(),
  email: varchar("email", { length: 200 }).unique(),
  avatar: text("avatar"),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  pincode: varchar("pincode", { length: 10 }),
  passwordHash: text("password_hash").default("google-oauth").notNull(),
  googleId: varchar("google_id", { length: 200 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id")
    .references(() => customers.id)
    .notNull(),
  status: orderStatusEnum("status").default("pending").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  deliveryCity: varchar("delivery_city", { length: 100 }),
  deliveryPincode: varchar("delivery_pincode", { length: 10 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .references(() => orders.id)
    .notNull(),
  productId: integer("product_id")
    .references(() => products.id)
    .notNull(),
  productName: varchar("product_name", { length: 200 }).notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
});

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
