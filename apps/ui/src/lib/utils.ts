import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number) => {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
	}).format(amount)
}

export const getMaskedNumber = (id = '') => {
	const l = id.toString().length
	let stars = ''
	for (let i = 0; i < (8 - l); i++) {
		stars += '*'
	}
	return `${stars}${id.toString()}`
}
