import { Avatar, AvatarFallback, AvatarImage } from '../avatar.tsx'
import { FormInput } from './form-input.tsx'
import { User } from 'npm:lucide-react'

export function CreateCustomerForm({ form, children }) {
	return (
		<div className='space-y-6'>
			<div className='flex justify-center mb-6'>
				<div className='relative'>
					<Avatar className='h-24 w-24 border-2 border-woof/40'>
						<AvatarImage src='' alt='Avatar preview' />
						<AvatarFallback className='text-2xl bg-yellow-100 text-woof'>
							{form.state.values.firstName && form.state.values.lastName
								? (
									`${form.state.values.firstName[0]}${form.state.values.lastName[0]}`
								)
								: <User className='h-12 w-12 text-woof/70' />}
						</AvatarFallback>
					</Avatar>
				</div>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<FormInput
					form={form}
					name='firstName'
					label='First Name'
					required
					placeholder='John'
				/>
				<FormInput
					form={form}
					name='lastName'
					label='Last Name'
					required
					placeholder='Smith'
				/>
			</div>

			<FormInput
				form={form}
				name='email'
				label='Email Address'
				required
				placeholder='john.smith@example.com'
			/>

			<FormInput
				form={form}
				name='phone'
				label='Phone Number'
				required
				type='tel'
				placeholder='(123) 456-7890'
			/>

			<div className='flex justify-end'>
				{children}
			</div>
		</div>
	)
}
