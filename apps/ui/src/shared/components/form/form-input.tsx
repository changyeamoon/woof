import { Label } from '../label.tsx'
import { Input } from '../input.tsx'
import { FieldInfo } from './field-info.tsx'

export function FormInput({ form, label, name, ...inputProps }) {
	return (
		<div>
			<form.Field
				name={name}
				children={(field) => (
					<>
						<Label htmlFor={field.name}>{label}</Label>
						<Input
							id={field.name}
							name={field.name}
							value={field.state.value}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							{...inputProps}
						/>
						<FieldInfo field={field} />
					</>
				)}
			/>
		</div>
	)
}
