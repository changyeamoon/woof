import { queryOptions, useMutation, useQuery } from '@tanstack/react-query'
import { Account, Customer } from '../../../types.ts'
import { api, queryClient } from '../../lib/init.ts'
import { qk } from './_qk.ts'

const useGetCustomers_Options = (customerId?: number) =>
	queryOptions({
		queryKey: [qk.getCustomers, customerId],
		queryFn: async () => {
			let res

			if (customerId) {
				res = await api.customers[':id'].$get({ param: { id: customerId } })
			} else {
				res = await api.customers.$get('/')
			}

			if (!res) {
				throw new Error('Customers not found')
			}

			return await res.json()
		},
	})

export const useGetCustomers_Prefetch = async () => {
	await queryClient.prefetchQuery(useGetCustomers_Options())
}

export function useGetCustomers() {
	return useQuery(useGetCustomers_Options())
}

export function useGetCustomer(customerId: number, options?: any) {
	return useQuery({ ...useGetCustomers_Options(customerId), ...options })
}

export function useCreateCustomerWithAccount() {
	return useMutation({
		mutationFn: async (customerWithAccount: Account & Customer) => {
			if (!customerWithAccount?.name) {
				customerWithAccount.name = customerWithAccount.type === 'checking' ? 'Checking' : 'Savings'
			}
			const res = await api.customers.withAccount.$post({ json: customerWithAccount })
			if (!res.ok) {
				throw new Error('Customer not created')
			}
			return await res.json()
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({ queryKey: [qk.getCustomers] })
		},
	})
}
