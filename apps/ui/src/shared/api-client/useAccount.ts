import { queryOptions, useMutation, useQuery } from '@tanstack/react-query'
import { Account } from '../../../types.ts'
import { api, queryClient } from '../../lib/init.ts'
import { qk } from './_qk.ts'

const useGetAccounts_Options = (customerId: number, accountId?: number) =>
	queryOptions({
		queryKey: [qk.getAccounts, customerId, accountId],
		queryFn: async () => {
			let res
			if (accountId) {
				res = await api.accounts.$get(`/${accountId}?customerId=${customerId}`)
			} else {
				res = await api.accounts.$get({ query: { customerId } })
			}

			if (!res) {
				throw new Error('Accounts not found')
			}

			return await res.json()
		},
	})

export const useGetAccounts_Prefetch = async (customerId: number) => {
	await queryClient.prefetchQuery(useGetAccounts_Options(customerId))
}

export function useGetAccounts(customerId: number, options: any) {
	return useQuery({ ...useGetAccounts_Options(customerId), ...options })
}

export function useGetAccount(customerId: number, accountId: number, options?: any) {
	return useQuery({ ...useGetAccounts_Options(customerId, accountId), ...options })
}

export function useCreateAccount() {
	return useMutation({
		mutationFn: async ({ account, customerId }: { account: Account; customerId: number }) => {
			const res = await api.accounts.$post({ json: account, query: { customerId } })
			if (!res.ok) {
				throw new Error('Account not created')
			}
			return await res.json()
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({ queryKey: [qk.getAccounts] })
		},
	})
}
