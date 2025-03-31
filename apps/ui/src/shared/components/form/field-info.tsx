import type { AnyFieldApi } from '@tanstack/react-form'

export function FieldInfo({ field }: { field: AnyFieldApi }) {
	return (
		<>
			{field.state.meta.isTouched && field.state.meta.errors.length
				? (
					<em className='text-red-500 text-sm'>
						{field.state.meta.errors.map((e) => e.message).join(',')}
					</em>
				)
				: field.state.meta.isValidating
				? <em className='text-sm'>Validating...</em>
				: null}
		</>
	)
}
