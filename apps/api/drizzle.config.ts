import { defineConfig } from 'drizzle-kit'

console.log(`Database URL: ${Deno.env.get('DATABASE_URL') ?? 'Not set'}`)

export default defineConfig({
	out: './drizzle',
	schema: './src/db/schema.ts',
	dialect: 'postgresql',
	// dont add driver, it defaults to pg. pg-lite breaks?
	dbCredentials: {
		url: Deno.env.get('DATABASE_URL')!,
	},
})
