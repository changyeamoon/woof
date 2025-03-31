import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useAtom } from 'jotai'

import { createAccountSchema, createCustomerSchema } from '../../../../api/types.ts'
import { customerIdAtom } from '../../lib/init.ts'

import { Button } from '../../shared/components/button.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../shared/components/tabs.tsx'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '../../shared/components/card.tsx'
import { useCreateCustomerWithAccount } from '../../shared/api-client/useCustomer.ts'
import { CreateCustomerForm } from '../../shared/components/form/create-customer.tsx'
import { CreateAccountForm } from '../../shared/components/form/create-account.tsx'

export const Route = createFileRoute('/customers_/create')({
	component: CreateCustomer,
})

export default function CreateCustomer() {
	const navigate = useNavigate()

	const { mutateAsync: createCustomerWithAccount } = useCreateCustomerWithAccount()
	const [, setCustomerId] = useAtom(customerIdAtom)

	const form = useForm({
		defaultValues: {
			firstName: '',
			lastName: '',
			email: '',
			phone: '',
			type: 'checking',
			name: '',
			balance: 0,
		},
		validators: {
			onChange: createCustomerSchema.merge(createAccountSchema),
		},
		onSubmit: async ({ value }) => {
			createCustomerWithAccount(value, {
				onSuccess: ({ customer }) => {
					setCustomerId(customer.id)
					navigate({ to: '/accounts' })
				},
			})
		},
	})
	// TODO: remove console
	console.log('form = ', form)

	const [currentTab, setCurrentTab] = useState('customer')

	const validateCustomerAndProceed = () => {
		const { fields } = form.getAllErrors()
		if (
			fields?.firstName || fields?.lastName || fields?.email || fields?.phone
		) {
			alert('Please fill out all required fields.')
		} else {
			setCurrentTab('account')
		}
	}

	return (
		<main className='flex-1 container mx-auto px-4 py-8 max-w-3xl'>
			<Card className='shadow-lg'>
				<CardHeader className='text-center'>
					<CardTitle className='text-2xl'>Welcome to Woof</CardTitle>
					<CardDescription>
						Let's get started by creating your first customer profile and account
					</CardDescription>
				</CardHeader>

				<CardContent>
					<Tabs value={currentTab} defaultValue='customer' className='w-full'>
						<TabsList className='grid w-full grid-cols-2 mb-6'>
							<TabsTrigger value='customer' onClick={() => setCurrentTab('customer')}>
								Customer Information
							</TabsTrigger>
							<TabsTrigger value='account' onClick={validateCustomerAndProceed}>
								Account Setup
							</TabsTrigger>
						</TabsList>

						<form
							onSubmit={(e) => {
								e.preventDefault()
								e.stopPropagation()
								form.handleSubmit()
							}}
						>
							<TabsContent value='customer'>
								<CreateCustomerForm form={form}>
									<Button
										type='button'
										onClick={validateCustomerAndProceed}
									>
										Continue to Account Setup
									</Button>
								</CreateCustomerForm>
							</TabsContent>

							<TabsContent value='account'>
								<CreateAccountForm form={form}>
									<Button
										type='button'
										variant='outline'
										onClick={() => setCurrentTab('customer')}
									>
										Back to Customer Info
									</Button>
									<form.Subscribe
										selector={(state) => [state.canSubmit, state.isSubmitting]}
										children={([canSubmit, isSubmitting]) => (
											<Button type='submit' disabled={!canSubmit}>
												{isSubmitting ? 'Creating Account...' : 'Create Customer & Account'}
											</Button>
										)}
									/>
								</CreateAccountForm>
							</TabsContent>
						</form>
					</Tabs>
				</CardContent>

				<CardFooter className='flex justify-center border-t pt-6'>
					<p className='text-sm text-muted-foreground'>
						By creating an account, you agree to our{' '}
						<Link disabled to='/' className='text-blue-600 hover:underline'>
							Terms of Service
						</Link>{' '}
						and{' '}
						<Link disabled to='/' className='text-blue-600 hover:underline'>
							Privacy Policy
						</Link>
					</p>
				</CardFooter>
			</Card>
		</main>
	)
}
