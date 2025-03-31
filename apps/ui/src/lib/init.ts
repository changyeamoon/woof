import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient()

import { hc } from 'hono/client'
import { type ApiRoutes } from '../../../api/src/index.ts'
export const api = hc<ApiRoutes>('/').api

import { atom } from 'jotai'

export const customerIdAtom = atom<number | null>(null)
