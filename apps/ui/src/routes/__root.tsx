import { useEffect, useState } from 'react'
import { createRootRouteWithContext, Outlet, useNavigate } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Link } from '@tanstack/react-router'
import { useAtom } from 'jotai'

import { useGetCustomers } from '../shared/api-client/useCustomer.ts'
import { useGetAccounts_Prefetch } from '../shared/api-client/useAccount.ts'
import { customerIdAtom } from '../lib/init.ts'

import { ChevronDown, Menu, User, X } from 'lucide-react'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '../shared/components/dropdown-menu.tsx'
import { Button } from '../shared/components/button.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '../shared/components/avatar.tsx'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../shared/components/input-otp.tsx'

export const Route = createRootRouteWithContext()({ component: RootComponent })

function RootComponent() {
	const [isAuthenticated, setPin] = useLocalStorage('woofed', false)
	const navigate = useNavigate()
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	const [customerId, setCustomerId] = useAtom(customerIdAtom)

	const { data: customers, isLoading: isLoadingCustomers } = useGetCustomers()

	const selectedCustomer = customers?.find((customer) => customer.id === customerId)

	const hasCustomers = customers && customers.length > 0 && !isLoadingCustomers

	useEffect(() => {
		if (customers && customers.length && !customerId) {
			setCustomerId(customers[0].id)
		}
	}, [customers, customerId, setCustomerId])

	if (!isAuthenticated) {
		return (
			<div className='flex h-screen items-center justify-center'>
				<InputOTP
					maxLength={4}
					onComplete={(value) => {
						if (value === 'meow') {
							setPin(true)
						}
					}}
				>
					<InputOTPGroup>
						<InputOTPSlot index={0} autoFocus />
						<InputOTPSlot index={1} />
						<InputOTPSlot index={2} />
						<InputOTPSlot index={3} />
					</InputOTPGroup>
				</InputOTP>
			</div>
		)
	}

	return (
		<>
			<div className='min-h-screen bg-slate-50'>
				<header className='sticky top-0 z-50 bg-woof text-white shadow-md'>
					<div className='container mx-auto px-4'>
						<div className='flex h-16 items-center justify-between'>
							<div className='flex items-center'>
								<Link to='/' className='text-xl font-bold mr-8'>
									WOOF
								</Link>

								<nav className='hidden md:flex space-x-6'>
									<NavLinks hasCustomers={hasCustomers} />
								</nav>
							</div>

							<div className='flex items-center space-x-4'>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant='ghost' className='flex items-center gap-2 hover:bg-woof'>
											<Avatar className='h-8 w-8'>
												<AvatarImage src='' alt={selectedCustomer?.firstName} />
												<AvatarFallback className='text-woof'>
													{selectedCustomer?.firstName[0]}{selectedCustomer?.lastName[0]}
												</AvatarFallback>
											</Avatar>
											<span className='hidden md:inline'>{selectedCustomer?.firstName}</span>
											<ChevronDown className='h-4 w-4' />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align='end' className='w-56'>
										{customers?.map((customer) => (
											<DropdownMenuItem
												key={customer.id}
												onMouseEnter={() => {
													useGetAccounts_Prefetch(customer.id)
												}}
												onClick={() => {
													setCustomerId(customer.id)
												}}
											>
												<Link
													to='/accounts'
													className='flex items-center gap-2  py-2'
												>
													<Avatar className='h-8 w-8'>
														<AvatarImage src='' alt={customer.firstName} />
														<AvatarFallback>
															{customer.firstName[0]}{customer.lastName[0]}
														</AvatarFallback>
													</Avatar>
													<span>{customer.firstName} {customer.lastName}</span>
												</Link>
											</DropdownMenuItem>
										))}
										<DropdownMenuItem
											className='flex items-center gap-2 py-2 text-woof cursor-pointer'
											onClick={() => {
												navigate({ to: '/customers/create' })
											}}
										>
											<User className='h-4 w-4' />
											<span>Add Customer</span>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>

								{/* mobile menu button */}
								<Button
									variant='ghost'
									size='icon'
									className='md:hidden hover:bg-woof/70'
									onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
								>
									{mobileMenuOpen ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
								</Button>
							</div>
						</div>
					</div>

					{/* mobile menu */}
					{mobileMenuOpen && (
						<div className='md:hidden bg-woof/70 pb-4 px-4'>
							<nav className='flex flex-col space-y-3 mb-4'>
								<NavLinks hasCustomers={hasCustomers} />
							</nav>
						</div>
					)}
				</header>

				{isLoadingCustomers ? null : <Outlet />}
			</div>

			<ReactQueryDevtools initialIsOpen={false} />
			<TanStackRouterDevtools />
		</>
	)
}

const NavLinks = ({ hasCustomers }: { hasCustomers: boolean }) => {
	return (
		<>
			{hasCustomers
				? (
					<>
						<Link to='/accounts' className='hover:text-blue-200 transition-colors'>
							Accounts
						</Link>
						<Link to='/transfers' className='hover:text-blue-200 transition-colors'>
							Pay & Transfer
						</Link>
					</>
				)
				: null}
			<Link to='/about' className='hover:text-blue-200 transition-colors'>
				About
			</Link>
		</>
	)
}

export function useLocalStorage<T>(key: string, initialValue: T) {
	// State to store our value
	// Pass initial state function to useState so logic is only executed once
	const [storedValue, setStoredValue] = useState(() => {
		try {
			// Get from local storage by key
			const item = window.localStorage.getItem(key)
			// Parse stored json or if none return initialValue
			return item ? JSON.parse(item) : initialValue
		} catch (error) {
			// If error also return initialValue
			console.log(error)
			return initialValue
		}
	})

	// Return a wrapped version of useState's setter function that ...
	// ... persists the new value to localStorage.
	const setValue = (value: ((key: T) => T) | T) => {
		try {
			// Allow value to be a function so we have same API as useState
			const valueToStore = value instanceof Function ? value(storedValue) : value
			// Save state
			setStoredValue(valueToStore)
			// Save to local storage
			window.localStorage.setItem(key, JSON.stringify(valueToStore))
		} catch (error) {
			// A more advanced implementation would handle the error case
			console.log(error)
		}
	}

	return [storedValue, setValue]
}
