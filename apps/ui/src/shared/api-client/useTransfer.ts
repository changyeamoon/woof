import { queryOptions, useMutation, useQuery } from '@tanstack/react-query'
import { Transfer } from '../../../types.ts'
import { api, queryClient } from '../../lib/init.ts'
import { qk } from './_qk.ts'

const useGetTransfers_Options = (accountId: number, transferId?: number) =>
	queryOptions({
		queryKey: [qk.getTransfers, accountId, transferId],
		queryFn: async () => {
			let res
			if (transferId) {
				res = await api.transfers.$get(`/${transferId}?accountId=${accountId}`)
			} else {
				res = await api.transfers.$get({ query: { accountId } })
			}

			if (!res) {
				throw new Error('Transfers not found')
			}

			return await res.json()
		},
	})

export const useGetTransfers_Prefetch = async (accountId: number) => {
	await queryClient.prefetchQuery(useGetTransfers_Options(accountId))
}

export function useGetTransfers(accountId: number, options: any) {
	return useQuery({ ...useGetTransfers_Options(accountId), ...options })
}

export function useGetTransfer(accountId: number, transferId: number, options?: any) {
	return useQuery({ ...useGetTransfers_Options(accountId, transferId), ...options })
}

export function useCreateTransfer() {
	return useMutation({
		mutationFn: async (
			{ transfer, fromCustomerId, toCustomerId }: {
				transfer: Transfer
				fromCustomerId: number
				toCustomerId: number
			},
		) => {
			const res = await api.transfers.$post({ json: transfer, query: { fromCustomerId, toCustomerId } })
			if (!res.ok) {
				throw new Error('Transfer not created')
			}
			return await res.json()
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({ queryKey: [qk.getTransfers] })
			await queryClient.invalidateQueries({ queryKey: [qk.getAccounts] })
		},
	})
}
