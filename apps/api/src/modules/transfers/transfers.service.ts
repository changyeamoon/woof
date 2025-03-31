import { db } from '../../db/index.ts'
import { account as accountTable, transfer as transferTable } from '../../db/schema.ts'
import { eq, inArray } from 'drizzle-orm'

export const processTransferState = async (
	transferPayload: createTransferSchema,
	fromCustomerId: string,
	toCustomerId: string,
) => {
	// Step 1: Initiate Transfer (Start in INITIATED state)
	const [{ id: transferId }] = await db.insert(transferTable).values({
		...transferPayload,
		transactionState: 'INITIATED',
	}).returning()

	// Step 2: Validate Accounts
	const accounts = await db.select().from(accountTable).where(
		inArray(accountTable.id, [transferPayload.fromAccountId, transferPayload.toAccountId]),
	)
	const account = accounts.find((acc) => acc.id === transferPayload.fromAccountId)
	const toAccount = accounts.find((acc) => acc.id === transferPayload.toAccountId)

	let result = { error: '', state: '' }
	if (!toAccount) {
		result = { error: 'To account does not exist', state: 'FAILED' }
	} else if (!account) {
		result = { error: 'From account does not exist', state: 'FAILED' }
	} else if (account?.customerId !== Number.parseInt(fromCustomerId)) {
		result = { error: 'Account does not belong to customer', state: 'FAILED' }
	} else if (toAccount?.customerId !== Number.parseInt(toCustomerId)) {
		result = { error: 'To account does not belong to customer', state: 'FAILED' }
	} else if (account?.balance < transferPayload.amount) {
		result = { error: 'Insufficient funds', state: 'FAILED' }
	}

	if (result.state === 'FAILED') {
		await db.update(transferTable)
			.set({ transactionState: 'FAILED' })
			.where(eq(transferTable.id, transferId))

		return result
	}

	// Step 3: Mark Transfer as VALIDATED
	await db.update(transferTable)
		.set({ transactionState: 'VALIDATED' })
		.where(eq(transferTable.id, transferId))

	// Step 4: Execute Transfer (Create the transfer in the system)
	await db.update(accountTable)
		.set({ balance: account!.balance - transferPayload.amount })
		.where(eq(accountTable.id, transferPayload.fromAccountId))

	await db.update(accountTable)
		.set({ balance: toAccount!.balance + transferPayload.amount })
		.where(eq(accountTable.id, transferPayload.toAccountId))

	// Step 5: Mark Transfer as PENDING
	await db.update(transferTable)
		.set({ transactionState: 'PENDING' })
		.where(eq(transferTable.id, transferId))

	// Step 6: If all goes well, mark Transfer as COMPLETED
	await db.update(transferTable)
		.set({ transactionState: 'COMPLETED' })
		.where(eq(transferTable.id, transferId))

	return { message: 'Transfer completed successfully', state: 'COMPLETED' }
}
