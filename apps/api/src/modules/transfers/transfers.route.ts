import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { createTransferSchema } from '../../../types.ts'
import { createTransfer, getTransfer, getTransfers } from './transfers.controller.ts'

// validators
const queryValidator = (field: string) =>
	zValidator(
		'query',
		z.object({
			[field]: z.string(),
		}),
	)
const createTransferValidator = zValidator('json', createTransferSchema)

// routes
export const transferRoutes = new Hono()
	.get('/', queryValidator('accountId'), getTransfers)
	.get('/:id{[0-9]+}', queryValidator('accountId'), getTransfer)
	.post(
		'/',
		queryValidator('fromCustomerId'),
		queryValidator('toCustomerId'),
		createTransferValidator,
		createTransfer,
	)
