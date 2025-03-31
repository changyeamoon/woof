import { Label } from '../label.tsx'
import { RadioGroup, RadioGroupItem } from '../radio-group.tsx'
import { TooltipNow } from '../tooltip.tsx'
import { FormInput } from './form-input.tsx'
import { CreditCard, DollarSign, Home } from 'npm:lucide-react'

export function CreateAccountForm({ form, children }) {
	return (
		<div className='space-y-6'>
			<div className='space-y-4'>
				<Label>Account Type</Label>

				<form.Field
					name='type'
					children={(field) => (
						<>
							<RadioGroup
								defaultValue='checking'
								onValueChange={field.handleChange}
								className='grid grid-cols-1 md:grid-cols-3 gap-4'
							>
								<div className='relative'>
									<RadioGroupItem
										value='checking'
										id='checking'
										className='peer sr-only'
									/>
									<Label
										htmlFor='checking'
										className='flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-600 [&:has([data-state=checked])]:border-blue-600'
									>
										<div className='mb-3 rounded-full bg-blue-100 p-2 text-blue-600'>
											<DollarSign className='h-6 w-6' />
										</div>
										<div className='text-center'>
											<p className='font-medium'>Checking</p>
											<p className='text-sm text-muted-foreground'>
												Everyday transactions
											</p>
										</div>
									</Label>
								</div>

								<div className='relative'>
									<RadioGroupItem
										value='saving'
										id='saving'
										className='peer sr-only'
									/>
									<Label
										htmlFor='saving'
										className='flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-600 [&:has([data-state=checked])]:border-green-600'
									>
										<div className='mb-3 rounded-full bg-green-100 p-2 text-green-600'>
											<Home className='h-6 w-6' />
										</div>
										<div className='text-center'>
											<p className='font-medium'>Savings</p>
											<p className='text-sm text-muted-foreground'>Earn interest</p>
										</div>
									</Label>
								</div>

								<TooltipNow text='Coming Soon!'>
									<div className='relative'>
										<RadioGroupItem
											disabled
											value='credit-card'
											id='credit-card'
											className='peer sr-only'
										/>
										<Label
											aria-disabled
											htmlFor='credit-card'
											className='flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-purple-600 [&:has([data-state=checked])]:border-purple-600'
										>
											<div className='mb-3 rounded-full bg-purple-100 p-2 text-purple-600'>
												<CreditCard className='h-6 w-6' />
											</div>
											<div className='text-center'>
												<p className='font-medium'>Credit Card</p>
												<p className='text-sm text-muted-foreground'>
													Flexible spending
												</p>
											</div>
										</Label>
									</div>
								</TooltipNow>
							</RadioGroup>
						</>
					)}
				/>
			</div>

			<FormInput
				form={form}
				name='name'
				label='Account Name'
				required
				placeholder={`${
					form.state.values.type === 'checking'
						? 'Total Checking'
						: form.state.values.type === 'saving'
						? 'Savings Account'
						: 'Freedom Unlimited'
				}`}
			/>

			{form.state.values.type !== 'credit-card' && (
				<FormInput
					form={form}
					name='balance'
					label='Initial Deposit Amount ($)'
					required
					type='number'
					min='0'
					step='0.01'
					placeholder='0.00'
				/>
			)}

			<div className='flex justify-between'>
				{children}
			</div>
		</div>
	)
}
