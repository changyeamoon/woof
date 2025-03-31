import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useAtom } from 'jotai'
import { CheckCircle2 } from 'lucide-react'

import { customerIdAtom } from '../lib/init.ts'
import { useCreateTransfer } from '../shared/api-client/useTransfer.ts'
import { cn, formatCurrency, getMaskedNumber } from '../lib/utils.ts'
import { useGetCustomers } from '../shared/api-client/useCustomer.ts'
import { useGetAccounts } from '../shared/api-client/useAccount.ts'

import { Button } from '../shared/components/button.tsx'
import { Input } from '../shared/components/input.tsx'
import { Label } from '../shared/components/label.tsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../shared/components/card.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '../shared/components/avatar.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../shared/components/tabs.tsx'
import { Alert, AlertDescription, AlertTitle } from '../shared/components/alert.tsx'
import { AccountIcon } from '../shared/components/form/account-icon.tsx'

export const Route = createFileRoute('/transfers')({ component: PayAndTransfer })

// thank you ai
export default function PayAndTransfer() {
	const [customerId] = useAtom(customerIdAtom)

	const { data: customers } = useGetCustomers()

	const selectedCustomer = customers?.find((customer) => customer.id === customerId)

	const [transferStep, setTransferStep] = useState(1)

	const { data: accounts } = useGetAccounts(customerId!, {
		enabled: !!customerId,
	})

	const { mutateAsync: transferMoney, isSuccess: transferSuccess, reset: resetCreateTransfer } =
		useCreateTransfer()

	// Form state
	const [fromAccountId, setFromAccountId] = useState<number | null>(null)
	const [toCustomerId, setToCustomerId] = useState<number | null>(null)
	const [toAccountId, setToAccountId] = useState<number | null>(null)
	const [transferAmount, setTransferAmount] = useState('')
	const [transferDescription, setTransferDescription] = useState('')
	const [isTransferring, setIsTransferring] = useState(false)
	const [transferError, setTransferError] = useState<string | null>(null)

	const { data: toAccounts } = useGetAccounts(toCustomerId!, {
		enabled: !!toCustomerId,
	})

	const getAccountById = (_accounts, accountId: number) => {
		const account = _accounts.find((acc) => acc.id === accountId)
		if (account) {
			return account
		}

		return null
	}

	const getCustomerById = (customerId: number) => {
		return customers.find((c) => c.id === customerId) || null
	}

	const handleNextStep = () => {
		if (transferStep === 1 && fromAccountId) {
			setTransferStep(2)
		} else if (transferStep === 2 && toCustomerId && toAccountId) {
			setTransferStep(3)
		}
	}

	const handlePrevStep = () => {
		if (transferStep > 1) {
			setTransferStep(transferStep - 1)
		}
	}

	const handleTransfer = (e: React.FormEvent) => {
		e.preventDefault()

		if (
			!fromAccountId || !toCustomerId || !toAccountId || !transferAmount ||
			Number.parseFloat(transferAmount) <= 0
		) {
			setTransferError('Please fill in all required fields with valid values.')
			return
		}

		const sourceAccountInfo = getAccountById(accounts, fromAccountId)
		if (!sourceAccountInfo) {
			setTransferError('Source account not found.')
			return
		}

		// Check if there are sufficient funds
		if (Number.parseFloat(transferAmount) > sourceAccountInfo.balance) {
			setTransferError('Insufficient funds in the source account.')
			return
		}

		setTransferError(null)
		setIsTransferring(true)

		transferMoney({
			transfer: { fromAccountId, toAccountId, amount: transferAmount, description: transferDescription },
			fromCustomerId: customerId!,
			toCustomerId,
		}, {
			onSettled: () => {
				setTransferStep(1)
				setFromAccountId(null)
				setToCustomerId(null)
				setToAccountId(null)
				setTransferAmount('')
				setTransferDescription('')
			},
		})
	}

	const resetForm = () => {
		resetCreateTransfer()
		setTransferStep(1)
		setFromAccountId(null)
		setToCustomerId(null)
		setToAccountId(null)
		setTransferAmount('')
		setTransferDescription('')
		setTransferError(null)
	}

	return (
		<main className='container mx-auto px-4 py-8'>
			<div className='mb-8'>
				<h1 className='text-2xl font-bold text-gray-800'>Pay & Transfer</h1>
				<p className='text-gray-600'>Send money to other customers or between your accounts</p>
			</div>

			<div className='grid md:grid-cols-3 gap-8'>
				<div className='md:col-span-2'>
					<Card className='shadow-sm'>
						<CardHeader>
							<CardTitle>Transfer Between Customers</CardTitle>
							<CardDescription>Send money to other MyBank customers securely and instantly</CardDescription>
						</CardHeader>

						<CardContent>
							{transferSuccess
								? (
									<div className='flex flex-col items-center justify-center py-8'>
										<div className='bg-green-100 text-green-600 p-4 rounded-full mb-4'>
											<CheckCircle2 className='h-12 w-12' />
										</div>
										<h3 className='text-xl font-medium text-center'>Transfer Successful!</h3>
										<p className='text-gray-500 text-center mt-2 mb-4 max-w-md'>
											Your transfer has been processed successfully. The recipient will receive the funds immediately.
										</p>
										<Button onClick={resetForm}>Make Another Transfer</Button>
									</div>
								)
								: (
									<form onSubmit={handleTransfer}>
										<Tabs value={`step-${transferStep}`} className='w-full'>
											<TabsList className='grid w-full grid-cols-3 mb-8'>
												<TabsTrigger
													value='step-1'
													disabled={transferStep !== 1}
													className={transferStep >= 1 ? 'text-woof' : ''}
												>
													From
												</TabsTrigger>
												<TabsTrigger
													value='step-2'
													disabled={transferStep !== 2}
													className={transferStep >= 2 ? 'text-woof' : ''}
												>
													To
												</TabsTrigger>
												<TabsTrigger
													value='step-3'
													disabled={transferStep !== 3}
													className={transferStep >= 3 ? 'text-woof' : ''}
												>
													Review
												</TabsTrigger>
											</TabsList>

											<TabsContent value='step-1' className='space-y-4 py-4'>
												<div className='space-y-2'>
													<Label htmlFor='fromAccount'>Select Your Account</Label>
													<div className='grid gap-4'>
														{accounts?.map((account) => (
															<div
																key={account.id}
																className={cn(
																	'flex items-center p-4 border rounded-lg cursor-pointer transition-colors',
																	fromAccountId === account.id
																		? 'border-blue-600 bg-blue-50'
																		: 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50',
																)}
																onClick={() => setFromAccountId(account.id)}
															>
																<div
																	className={cn(
																		'p-2 rounded-full mr-4',
																		account.type === 'checking'
																			? 'bg-blue-100 text-blue-600'
																			: account.type === 'saving'
																			? 'bg-green-100 text-green-600'
																			: 'bg-purple-100 text-purple-600',
																	)}
																>
																	<AccountIcon type={account.type} />
																</div>
																<div className='flex-1'>
																	<h3 className='font-medium'>{account.name}</h3>
																	<p className='text-sm text-gray-500'>{getMaskedNumber(account.id)}</p>
																</div>
																<div className='text-right'>
																	<p className='font-semibold'>{formatCurrency(account.balance)}</p>
																	<p className='text-sm text-gray-500'>Available</p>
																</div>
															</div>
														))}
													</div>
												</div>

												<div className='flex justify-end mt-6'>
													<Button type='button' onClick={handleNextStep} disabled={!fromAccountId}>
														Continue
													</Button>
												</div>
											</TabsContent>

											<TabsContent value='step-2' className='space-y-4 py-4'>
												<div className='space-y-4'>
													<div className='space-y-2'>
														<Label>Select Recipient</Label>
														<div className='grid gap-4'>
															{customers
																?.filter((customer) => customer?.id !== selectedCustomer?.id)
																?.map((customer) => (
																	<div
																		key={customer.id}
																		className={cn(
																			'flex items-center p-4 border rounded-lg cursor-pointer transition-colors',
																			toCustomerId === customer.id
																				? 'border-blue-600 bg-blue-50'
																				: 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50',
																		)}
																		onClick={() => {
																			setToCustomerId(customer.id)
																			setToAccountId(null) // Reset selected account when changing customer
																		}}
																	>
																		<Avatar className='h-12 w-12 mr-4'>
																			<AvatarImage alt={customer.firstName} />
																			<AvatarFallback>{customer.firstName[0]}{customer.lastName[0]}</AvatarFallback>
																		</Avatar>
																		<div>
																			<h3 className='font-medium'>{customer.firstName} {customer.lastName}</h3>
																			<p className='text-sm text-gray-500'>{customer.email}</p>
																		</div>
																	</div>
																))}
														</div>
													</div>

													{toCustomerId && (
														<div className='space-y-2 mt-6'>
															<Label>Select Recipient's Account</Label>
															<div className='grid gap-4'>
																{toAccounts?.map((account) => (
																	<div
																		key={account.id}
																		className={cn(
																			'flex items-center p-4 border rounded-lg cursor-pointer transition-colors',
																			toAccountId === account.id
																				? 'border-blue-600 bg-blue-50'
																				: 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50',
																		)}
																		onClick={() => setToAccountId(account.id)}
																	>
																		<div
																			className={cn(
																				'p-2 rounded-full mr-4',
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
																			<p className='text-sm text-gray-500'>{account.accountNumber}</p>
																		</div>
																	</div>
																))}
															</div>
														</div>
													)}
												</div>

												<div className='flex justify-between mt-6'>
													<Button type='button' variant='outline' onClick={handlePrevStep}>
														Back
													</Button>
													<Button type='button' onClick={handleNextStep} disabled={!toCustomerId || !toAccountId}>
														Continue
													</Button>
												</div>
											</TabsContent>

											<TabsContent value='step-3' className='space-y-4 py-4'>
												<div className='space-y-6'>
													<div className='space-y-2'>
														<Label htmlFor='amount'>Transfer Amount</Label>
														<div className='relative'>
															<span className='absolute left-3 top-1.5 text-gray-500'>$</span>
															<Input
																id='amount'
																type='number'
																min='0.01'
																step='0.01'
																placeholder='0.00'
																className='pl-8'
																value={transferAmount}
																onChange={(e) => setTransferAmount(e.target.value)}
																required
															/>
														</div>
													</div>

													<div className='space-y-2'>
														<Label htmlFor='description'>Description (Optional)</Label>
														<Input
															id='description'
															placeholder='Add a note about this transfer'
															value={transferDescription}
															onChange={(e) => setTransferDescription(e.target.value)}
														/>
													</div>

													<div className='bg-gray-50 p-4 rounded-lg space-y-4'>
														<h3 className='font-medium text-gray-700'>Transfer Summary</h3>

														<div className='grid grid-cols-2 gap-2 text-sm'>
															<p className='text-gray-500'>From:</p>
															<p className='font-medium'>{fromAccountId && getAccountById(accounts, fromAccountId)?.name}</p>

															<p className='text-gray-500'>To:</p>
															<p className='font-medium'>
																{toCustomerId &&
																	toAccountId &&
																	`${getCustomerById(toCustomerId)?.firstName} ${getCustomerById(toCustomerId)?.lastName} - ${
																		getAccountById(toAccounts, toAccountId)?.name
																	}`}
															</p>

															<p className='text-gray-500'>Amount:</p>
															<p className='font-medium'>
																{transferAmount ? formatCurrency(Number.parseFloat(transferAmount)) : '$0.00'}
															</p>

															{transferDescription && (
																<>
																	<p className='text-gray-500'>Description:</p>
																	<p className='font-medium'>{transferDescription}</p>
																</>
															)}
														</div>
													</div>

													{transferError && (
														<Alert variant='destructive'>
															<AlertTitle>Error</AlertTitle>
															<AlertDescription>{transferError}</AlertDescription>
														</Alert>
													)}
												</div>

												<div className='flex justify-between mt-6'>
													<Button type='button' variant='outline' onClick={handlePrevStep}>
														Back
													</Button>
													<Button
														type='submit'
														disabled={!fromAccountId ||
															!toCustomerId ||
															!toAccountId ||
															!transferAmount ||
															Number.parseFloat(transferAmount) <= 0 ||
															isTransferring}
													>
														{isTransferring ? 'Processing...' : 'Complete Transfer'}
													</Button>
												</div>
											</TabsContent>
										</Tabs>
									</form>
								)}
						</CardContent>
					</Card>
				</div>
			</div>
		</main>
	)
}
