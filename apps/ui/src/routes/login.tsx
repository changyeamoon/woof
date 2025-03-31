import { createFileRoute } from '@tanstack/react-router'
import { signIn } from '../lib/auth-client.ts'

export const Route = createFileRoute('/login')({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div className='flex h-full justify-center items-center'>
			<button
				type='button'
				onClick={async () => {
					await signIn.magicLink({
						email: 'dev@dev.com',
						// Use the dashboard url
						callbackURL: 'http://localhost:5001/',
					})
				}}
			>
				Send Magic Link{' '}
			</button>
		</div>
	)
}
