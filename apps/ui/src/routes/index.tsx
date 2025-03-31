import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAtom } from 'jotai'

import { customerIdAtom } from '../lib/init.ts'

export const Route = createFileRoute('/')({ component: Homepage })

export default function Homepage() {
	const navigate = useNavigate()

	const [customerId] = useAtom(customerIdAtom)

	useEffect(() => {
		if (customerId) {
			navigate({ to: '/accounts' })
			return
		} else {
			navigate({ to: '/customers/create' })
		}
	}, [customerId, navigate])

	return null
}
