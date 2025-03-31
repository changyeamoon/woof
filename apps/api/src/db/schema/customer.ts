import { integer, pgTable, uniqueIndex, varchar } from 'drizzle-orm/pg-core'
import { timestamps } from './_helper.ts'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const customer = pgTable('customer', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	firstName: varchar('first_name', { length: 256 }).notNull(),
	lastName: varchar('last_name', { length: 256 }).notNull(),
	email: varchar().unique().notNull(),
	phone: varchar({ length: 256 }).unique().notNull(),
	...timestamps,
}, (table) => [
	uniqueIndex('email_idx').on(table.email),
	uniqueIndex('phone_idx').on(table.phone),
])

// TODO: drizzle-zod and zod-validator dont seem to play well. Would be nice to get this to work
export const customerSelectSchema = createSelectSchema(customer)
export const customerInsertSchema = createInsertSchema(customer, {
	firstName: z.string().min(1, 'First name is required').max(256),
	lastName: z.string().min(1, 'Last name is required').max(256),
	email: z.string().email('Invalid email format'),
	phone: z.string().min(10, 'Phone number is too short').max(10),
})
