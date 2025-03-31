import { Dispatch, useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'

import { createAccountSchema, createTransferSchema } from '../../../api/types.ts'
import { customerIdAtom } from '../lib/init.ts'
import { cn, formatCurrency, getMaskedNumber } from '../lib/utils.ts'
import { useGetCustomer } from '../shared/api-client/useCustomer.ts'
import { useCreateAccount, useGetAccounts } from '../shared/api-client/useAccount.ts'
import {
	useCreateTransfer,
	useGetTransfers,
	useGetTransfers_Prefetch,
} from '../shared/api-client/useTransfer.ts'
import { CreateAccountForm } from '../shared/components/form/create-account.tsx'

import { ArrowRight, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../shared/components/card.tsx'
import { Button } from '../shared/components/button.tsx'
import { Label } from '../shared/components/label.tsx'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '../shared/components/dialog.tsx'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../shared/components/select.tsx'
import { FormInput } from '../shared/components/form/form-input.tsx'
import { AccountIcon } from '../shared/components/form/account-icon.tsx'

export const Route = createFileRoute('/accounts')({
	component: Accounts,
})

export default function Accounts() {
	const [customerId] = useAtom(customerIdAtom)
	const navigate = useNavigate()
	useEffect(() => {
		if (!customerId) {
			navigate({ to: '/' })
			return
		}
	}, [navigate])

	const { data: customer, isLoading: isLoadingCustomer, isPending } = useGetCustomer(customerId!, {
		enabled: !!customerId,
	})

	const { data: accounts } = useGetAccounts(customerId!, {
		enabled: !!customerId,
	})

	const [expandedAccounts, setExpandedAccounts] = useState<number[]>([])
	const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
	const [fromAccountId, setFromAccountId] = useState<number | null>(null)

	const toggleAccountExpand = (accountId: number) => {
		setExpandedAccounts((prev) =>
			prev.includes(accountId) ? prev.filter((id) => id !== accountId) : [...prev, accountId]
		)
	}

	const openTransferModal = (accountId: number) => {
		setFromAccountId(accountId)
		setIsTransferModalOpen(true)
	}

	if (isLoadingCustomer || isPending) {
		return (
			<div className='flex items-center justify-center h-screen'>
				<div className='loader'>loading...</div>
			</div>
		)
	}

	return (
		<main className='container mx-auto px-4 py-8'>
			<div className='mb-8'>
				<h1 className='text-2xl font-bold text-gray-800'>
					Welcome, {customer?.firstName} {customer?.lastName}
				</h1>
				<p className='text-gray-600'>Here's a summary of your accounts</p>
			</div>

			<div className='space-y-4'>
				{(accounts || [])?.map((account) => (
					<Card
						key={account.id}
						className={cn(
							'border-l-4',
							account.type === 'checking'
								? 'border-l-blue-600'
								: account.type === 'saving'
								? 'border-l-green-600'
								: 'border-l-purple-600',
						)}
						onMouseEnter={() => {
							useGetTransfers_Prefetch(account.id)
						}}
					>
						<CardHeader
							className='p-4 cursor-pointer'
							onClick={() => toggleAccountExpand(account.id)}
						>
							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-3'>
									<div
										className={cn(
											'p-2 rounded-full',
											account.type === 'checking'
												? 'bg-blue-100 text-blue-600'
												: account.type === 'saving'
												? 'bg-green-100 text-green-600'
												: 'bg-purple-100 text-purple-600',
										)}
									>
										<AccountIcon type={account.type} />
									</div>
									<div>
										<h3 className='font-medium'>{account.name}</h3>
										<p className='text-sm text-gray-500'>{getMaskedNumber(account?.id)}</p>
									</div>
								</div>
								<div className='flex items-center gap-4'>
									<Button
										variant='outline'
										size='sm'
										className='hidden md:flex items-center gap-1 mr-2'
										onClick={(e) => {
											e.stopPropagation()
											openTransferModal(account.id)
										}}
									>
										<ArrowRight className='h-4 w-4' />
										Transfer
									</Button>
									<div className='text-right'>
										<p className='font-semibold text-lg'>{formatCurrency(account.balance)}</p>
										<p className='text-sm text-gray-500'>Available Balance</p>
									</div>
									{expandedAccounts.includes(account.id)
										? <ChevronUp className='h-5 w-5 text-gray-400' />
										: <ChevronDown className='h-5 w-5 text-gray-400' />}
								</div>
							</div>
						</CardHeader>

						{expandedAccounts.includes(account.id) && <Transfers accountId={account.id} />}

						{!expandedAccounts.includes(account.id) && (
							<div className='md:hidden mt-4 border-t pt-4'>
								<Button
									variant='outline'
									size='sm'
									className='w-full flex items-center justify-center gap-1'
									onClick={(e) => {
										e.stopPropagation()
										openTransferModal(account.id)
									}}
								>
									<ArrowRight className='h-4 w-4' />
									Transfer Money
								</Button>
							</div>
						)}
					</Card>
				))}

				<TransferModal
					isTransferModalOpen={isTransferModalOpen}
					setIsTransferModalOpen={setIsTransferModalOpen}
					fromAccountId={fromAccountId}
				/>

				<CreateAccountModal />
			</div>
		</main>
	)
}

function Transfers({ accountId }: { accountId: number }) {
	const [customerId] = useAtom(customerIdAtom)
	const { data: accounts } = useGetAccounts(customerId!, {
		enabled: !!customerId,
	})
	const { data: transfers, isLoading: isLoadingTransfers, isPending } = useGetTransfers(accountId, {
		enabled: !!accountId,
	})

	const [slice, setSlice] = useState(3)

	const findAccountName = (id: number) => {
		const account = accounts?.find((account) => account.id === id)
		return account ? `${account.name}` : 'Unknown Account'
	}

	return (
		<CardContent className='border-t pt-4'>
			<h4 className='font-medium mb-3'>Recent Transfers</h4>
			<div className='space-y-2'>
				{isLoadingTransfers || isPending
					? <div>loading...</div>
					: transfers?.slice(0, slice)?.map((transfer) => (
						<div
							key={transfer.id}
							className='flex justify-between py-2 border-b border-gray-100'
						>
							<div>
								<p className='font-medium'>
									{transfer.description || transfer.toAccountId == accountId ? 'Deposit' : 'Withdrawal'} -{' '}
									{findAccountName(transfer.fromAccountId)}
								</p>
								<p className='text-sm text-gray-500'>{new Date(transfer.createdAt).toLocaleString()}</p>
							</div>
							<p
								className={cn(
									'font-medium',
									transfer.toAccountId == accountId ? 'text-green-600' : 'text-red-600',
								)}
							>
								{transfer.toAccountId == accountId ? '+' : '-'} {formatCurrency(transfer.amount)}
							</p>
						</div>
					))}
			</div>
			<div className='mt-4'>
				{transfers.length > 3
					? (
						<Button
							variant='outline'
							className='text-woof border-woof hover:bg-woof/30'
							onClick={() => {
								if (transfers.length <= slice) {
									setSlice(3)
								} else {
									setSlice(transfers.length)
								}
							}}
						>
							{transfers.length <= slice ? 'Collapse Transactions' : 'View All Transactions'}
						</Button>
					)
					: null}
			</div>
		</CardContent>
	)
}

function CreateAccountModal() {
	const { mutateAsync: createAccount } = useCreateAccount()
	const [customerId, setCustomerId] = useAtom(customerIdAtom)

	const form = useForm({
		defaultValues: {
			type: 'checking',
			name: '',
			balance: 0,
		},
		validators: {
			onChange: createAccountSchema,
		},
		onSubmit: async ({ value, formApi: { reset } }) => {
			createAccount({ account: value, customerId }, {
				onSuccess: (account) => {
					// TODO: remove console
					console.log('account = ', account)

					setCustomerId(account.customerId)
					reset()
				},
			})
		},
	})

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button className='bg-woof'>
					Create New Account
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-md md:max-w-lg'>
				<DialogHeader>
					<DialogTitle>Create Account</DialogTitle>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault()
						e.stopPropagation()
						form.handleSubmit()
					}}
				>
					<CreateAccountForm form={form}>
						<form.Subscribe
							selector={(state) => [state.canSubmit, state.isSubmitting]}
							children={([canSubmit, isSubmitting]) => (
								<DialogClose asChild>
									<Button type='submit' disabled={!canSubmit}>
										{isSubmitting ? 'Creating Account...' : 'Create Account'}
									</Button>
								</DialogClose>
							)}
						/>
					</CreateAccountForm>
				</form>
			</DialogContent>
		</Dialog>
	)
}

function TransferModal({
	isTransferModalOpen,
	setIsTransferModalOpen,
	fromAccountId,
}: {
	isTransferModalOpen: boolean
	setIsTransferModalOpen: Dispatch<React.SetStateAction<boolean>>
	fromAccountId: number
}) {
	const { mutateAsync: transferMoney, isSuccess: transferSuccess, reset: resetCreateTransfer } =
		useCreateTransfer()
	const [customerId] = useAtom(customerIdAtom)

	const { data: accounts } = useGetAccounts(customerId!, {
		enabled: !!customerId,
	})

	const form = useForm({
		defaultValues: {
			fromAccountId: fromAccountId,
			toAccountId: null,
			description: '',
			amount: 0,
		},
		validators: {
			// @ts-ignore
			onChange: createTransferSchema,
		},
		onSubmit: async ({ value, formApi: { reset } }) => {
			transferMoney({ transfer: value, fromCustomerId: customerId, toCustomerId: customerId }, {
				onSuccess: () => {
					reset()
					setTimeout(() => {
						resetCreateTransfer()
						setIsTransferModalOpen(false)
					}, 1800)
				},
			})
		},
	})

	return (
		<Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
			<DialogContent className='sm:max-w-md'>
				<DialogHeader>
					<DialogTitle>Transfer Money</DialogTitle>
					<DialogDescription>
						Move money between your accounts quickly and securely.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault()
						e.stopPropagation()
						form.handleSubmit()
					}}
					className='space-y-4 py-4'
				>
					{transferSuccess
						? (
							<div className='flex flex-col items-center justify-center py-4'>
								<div className='bg-green-100 text-green-600 p-3 rounded-full mb-4'>
									<CheckCircle2 className='h-8 w-8' />
								</div>
								<h3 className='text-xl font-medium text-center'>Transfer Successful!</h3>
								<p className='text-gray-500 text-center mt-1'>
									Your transfer has been processed successfully.
								</p>
							</div>
						)
						: (
							<>
								<div className='space-y-2'>
									<form.Field
										name='fromAccountId'
										children={(field) => (
											<>
												<Label htmlFor={field.name}>From Account</Label>
												<Select
													value={field.state.value.toString()}
													onValueChange={(value) => field.handleChange(Number(value))}
												>
													<SelectTrigger>
														<SelectValue placeholder='Select source account' />
													</SelectTrigger>
													<SelectContent>
														{accounts?.map((account) => (
															<SelectItem key={account.id} value={account.id.toString()}>
																{account.name} ({formatCurrency(account.balance)})
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</>
										)}
									/>
								</div>

								<div className='space-y-2'>
									<form.Field
										name='toAccountId'
										children={(field) => (
											<>
												<Label htmlFor={field.name}>To Account</Label>
												<Select
													value={field.state.value ? field.state.value.toString() : null}
													onValueChange={(value) => field.handleChange(Number(value))}
												>
													<SelectTrigger>
														<SelectValue placeholder='Select destination account' />
													</SelectTrigger>
													<SelectContent>
														{accounts
															?.filter((account) => account.id !== fromAccountId)
															?.map((account) => (
																<SelectItem key={account.id} value={account.id.toString()}>
																	{account.name} ({formatCurrency(account.balance)})
																</SelectItem>
															))}
													</SelectContent>
												</Select>
											</>
										)}
									/>
								</div>

								<div className='space-y-2'>
									<FormInput
										form={form}
										label='Amount'
										name='amount'
										required
										type='number'
										min='0.01'
										step='0.01'
										placeholder='0.00'
									/>
								</div>

								<div className='space-y-2'>
									<FormInput
										form={form}
										label='Description (Optional)'
										name='description'
										placeholder='Transfer description'
									/>
								</div>
							</>
						)}

					<DialogFooter className='mt-6'>
						{!transferSuccess && (
							<form.Subscribe
								selector={(state) => [state.canSubmit, state.isSubmitting]}
								children={([canSubmit, isSubmitting]) => (
									<>
										<Button
											type='button'
											variant='outline'
											onClick={() => setIsTransferModalOpen(false)}
											disabled={isSubmitting}
										>
											Cancel
										</Button>
										<Button type='submit' disabled={!canSubmit}>
											{isSubmitting ? 'Processing...' : 'Transfer Money'}
										</Button>
									</>
								)}
							/>
						)}
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
