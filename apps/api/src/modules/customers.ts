import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { zValidator } from '@hono/zod-validator'
import { db } from '../db/index.ts'
import { account as accountTable, customer as customerTable } from '../db/schema.ts'
import { createAccountSchema, createCustomerSchema } from '../../types.ts'

export const customerRoutes = new Hono()
	.get('/', async (c) => {
		const customers = await db.select().from(customerTable)
		return c.json(customers)
	})
	.get('/:id{[0-9]+}', async (c) => {
		const id = Number.parseInt(c.req.param('id'))
		const [customer] = await db
			.select()
			.from(customerTable)
			.where(eq(customerTable.id, id))

		if (!customer) {
			return c.notFound()
		}
		return c.json(customer)
	})
	.post('/', zValidator('json', createCustomerSchema), async (c) => {
		const customerPayload = c.req.valid('json')

		const result = await db
			.insert(customerTable)
			.values(customerPayload)
			.returning()

		c.status(201)
		return c.json(result[0])
	})
	.post(
		'/withAccount',
		zValidator('json', createCustomerSchema.merge(createAccountSchema)),
		async (c) => {
			const { firstName, lastName, email, phone, name, type, balance } = c.req.valid('json')

			const newCustomer = await db
				.insert(customerTable)
				.values({
					firstName,
					lastName,
					email,
					phone,
				})
				.returning()

			const customerId = newCustomer[0].id

			const newAccount = await db
				.insert(accountTable)
				.values({ customerId, name, type, balance })
				.returning()

			c.status(201)
			return c.json({ customer: newCustomer[0], account: newAccount[0] })
		},
	)
	.delete('/:id{[0-9]+}', async (c) => {
		const id = Number.parseInt(c.req.param('id'))

		const customer = await db
			.delete(customerTable)
			.where(eq(customerTable.id, id))
			.returning()

		return c.json(customer[0])
	})
