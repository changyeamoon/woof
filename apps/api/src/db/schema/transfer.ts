import { check, integer, numeric, pgEnum, pgTable, varchar } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { timestamps } from './_helper.ts'

import { account } from './account.ts'

export const transferStateEnum = pgEnum('transactionState', [
	'INITIATED',
	'VALIDATED',
	'PENDING',
	'COMPLETED',
	'FAILED',
])

export const transfer = pgTable('transfer', {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	fromAccountId: integer('from_account_id').notNull().references(() => account.id, {
		onDelete: 'cascade',
	}),
	toAccountId: integer('to_account_id').notNull().references(() => account.id, {
		onDelete: 'cascade',
	}),
	description: varchar({ length: 256 }),
	amount: numeric({ mode: 'number', precision: 12, scale: 2 }).notNull().default(0),
	transactionState: transferStateEnum().default('INITIATED').notNull(),
	...timestamps,
}, (table) => [
	check('amount_check', sql`${table.amount} > 0`),
])
