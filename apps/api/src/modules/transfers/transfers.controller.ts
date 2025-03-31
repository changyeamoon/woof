import { and, desc, eq, or } from 'drizzle-orm'

import { db } from '../../db/index.ts'
import { transfer as transferTable } from '../../db/schema.ts'
import { processTransferState } from './transfers.service.ts'
import { Context, Env } from 'hono'

export const getTransfers = async (c: Context<Env>) => {
	const { accountId } = c.req.query()

	const transfers = await db.select().from(transferTable).where(
		or(
			eq(transferTable.fromAccountId, Number.parseInt(accountId)),
			eq(transferTable.toAccountId, Number.parseInt(accountId)),
		),
	).orderBy(desc(transferTable.createdAt))

	return c.json(transfers)
}

export const getTransfer = async (c: Context<Env>) => {
	const id = Number.parseInt(c.req.param('id'))
	const { accountId } = c.req.query()

	const [transfer] = await db.select()
		.from(transferTable)
		.where(
			and(eq(transferTable.id, id), eq(transferTable.fromAccountId, Number.parseInt(accountId))),
		)

	if (!transfer) {
		return c.notFound()
	}
	return c.json(transfer)
}

export const createTransfer = async (c: Context<Env>) => {
	const transferPayload = c.req.valid('json')
	const { fromCustomerId, toCustomerId } = c.req.query()

	const result = await processTransferState(transferPayload, fromCustomerId, toCustomerId)

	if (result.state === 'FAILED') {
		return c.json({ error: result.error }, 400)
	}

	return c.json(result, 201)
}
