import { z } from 'zod'

// Customer
export const customerSchema = z.object({
	id: z.number().int().positive(),
	firstName: z.string().min(1, 'First name is required').max(256),
	lastName: z.string().min(1, 'Last name is required').max(256),
	email: z.string().email('Invalid email format'),
	phone: z.string().min(10, 'Phone number is too short').max(10),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
})
export const createCustomerSchema = customerSchema.omit({ id: true })
export type Customer = z.infer<typeof customerSchema>

// Account
export const accountTypeEnum = z.enum(['checking', 'saving'])
export const accountSchema = z.object({
	id: z.number().int().positive(),
	customerId: z.number().int().positive(),
	name: z.string().min(1, 'Account name is required').max(256),
	type: accountTypeEnum.default('checking'),
	balance: z.coerce.number().positive('Balance must be greater than 0'),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
})
export const createAccountSchema = accountSchema.omit({ id: true, customerId: true })
export type Account = z.infer<typeof accountSchema>

// Transfer
export const transferSchema = z.object({
	id: z.number().int().positive(),
	fromAccountId: z.number().int().positive(),
	toAccountId: z.number().int().positive(),
	amount: z.coerce.number().positive('Transfer amount must be greater than 0'),
	description: z.string().max(256).optional(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
})
export const createTransferSchema = transferSchema.omit({ id: true })
export type Transfer = z.infer<typeof transferSchema>
