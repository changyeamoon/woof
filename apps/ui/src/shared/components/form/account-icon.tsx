import { CreditCard, DollarSign, Home } from 'lucide-react'

export function AccountIcon({ type }: { type: string }) {
	switch (type) {
		case 'checking':
			return <DollarSign className='h-5 w-5' />
		case 'savings':
			return <Home className='h-5 w-5' />
		case 'credit-card':
			return <CreditCard className='h-5 w-5' />
		default:
			return <DollarSign className='h-5 w-5' />
	}
}
