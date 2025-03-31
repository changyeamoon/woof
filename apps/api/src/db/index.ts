// Make sure to install the 'postgres' package
import { drizzle } from 'drizzle-orm/neon-http'
import postgres from 'postgres'

// const queryClient = postgres(Deno.env.get('DATABASE_URL')!)
// export const db = drizzle({ client: queryClient, casing: 'snake_case' })
export const db = drizzle(Deno.env.get('DATABASE_URL')!)
const result = await db.execute('select 1')
