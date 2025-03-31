import { check, integer, numeric, pgEnum, pgTable, varchar } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { timestamps } from './_helper.ts'
import { z } from 'zod'

import { customer } from '../schema.ts'

export const accountTypeEnum = pgEnum('type', ['checking', 'saving'])
export const account = pgTable('account', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	customerId: integer('customer_id').notNull().references(() => customer.id, {
		onDelete: 'cascade',
	}),
	name: varchar({ length: 256 }).notNull(),
	type: accountTypeEnum().default('checking').notNull(),
	// think is about 12billion
	balance: numeric({ mode: 'number', precision: 12, scale: 2 }).notNull().default(0),
	...timestamps,
}, (table) => [
	check('balance_check', sql`${table.balance} > 0`),
])

export const accountSelectSchema = createSelectSchema(account)
export const accountInsertSchema = createInsertSchema(account)
