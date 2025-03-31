import { Hono } from 'hono'
import z from 'zod'
import { zValidator } from '@hono/zod-validator'

import { and, desc, eq } from 'drizzle-orm'

import { db } from '../db/index.ts'
import { account as accountTable } from '../db/schema.ts'
import { createAccountSchema } from '../../types.ts'

export const accountRoutes = new Hono()
	.get('/', zValidator('query', z.object({ customerId: z.string() })), async (c) => {
		const { customerId } = c.req.query()

		const accounts = await db.select().from(accountTable).where(
			eq(accountTable.customerId, Number.parseInt(customerId)),
		).orderBy(desc(accountTable.createdAt))
		return c.json(accounts)
	})
	.get('/:id{[0-9]+}', zValidator('query', z.object({ customerId: z.string() })), async (c) => {
		const id = Number.parseInt(c.req.param('id'))
		const { customerId } = c.req.query()

		const [account] = await db.select()
			.from(accountTable)
			.where(and(eq(accountTable.id, id), eq(accountTable.customerId, Number.parseInt(customerId))))

		if (!account) {
			return c.notFound()
		}
		return c.json(account)
	})
	.post(
		'/',
		zValidator('json', createAccountSchema),
		zValidator('query', z.object({ customerId: z.string() })),
		async (c) => {
			const { customerId } = c.req.query()

			const accountPayload = c.req.valid('json')
			// TODO: remove console
			console.log('customerId = ', customerId)

			const result = await db.insert(accountTable)
				.values({ ...accountPayload, customerId: Number.parseInt(customerId) })
				.returning()

			c.status(201)
			return c.json(result[0])
		},
	)
	.delete('/:id{[0-9]+}', async (c) => {
		const id = Number.parseInt(c.req.param('id'))

		const account = await db.delete(accountTable).where(eq(accountTable.id, id)).returning()

		return c.json(account[0])
	})
