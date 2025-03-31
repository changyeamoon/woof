import { Hono } from 'hono'
import { cors } from 'npm:hono/cors'
import { serveStatic } from 'hono/deno'
import { logger } from 'npm:hono/logger'

import { transferRoutes } from './modules/transfers/transfers.route.ts'
import { accountRoutes } from './modules/accounts.ts'
import { customerRoutes } from './modules/customers.ts'

const app = new Hono()

app.use('*', logger())

const apiRoutes = app.basePath('/api')
	.route('/customers', customerRoutes)
	.route('/accounts', accountRoutes)
	.route('/transfers', transferRoutes)

app.get('*', serveStatic({ root: '../ui/dist' }))
app.get('*', serveStatic({ path: '../ui/dist/index.html' }))

const port = 3001
console.log(`Server is running on http://localhost:${port}`)
console.log(`Database URL: ${Deno.env.get('DATABASE_URL') ?? 'Not set'}`)

// normally you write all fetch function but Hono lets use app.fetch
Deno.serve({ port }, app.fetch)
export type ApiRoutes = typeof apiRoutes

// app.use(
// 	'/api/auth/**', // or replace with "*" to enable cors for all routes
// 	// "*",
// 	cors({
// 		origin: 'http://localhost:5001', // replace with your origin
// 		allowHeaders: ['Content-Type', 'Authorization'],
// 		allowMethods: ['POST', 'GET', 'OPTIONS'],
// 		exposeHeaders: ['Content-Length'],
// 		maxAge: 600,
// 		credentials: true,
// 	}),
// )
//
// app.on(['POST', 'GET'], '/api/auth/**', (c) => {
// 	return auth.handler(c.req.raw)
// })
