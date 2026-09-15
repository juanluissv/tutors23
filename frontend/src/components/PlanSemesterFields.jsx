import {
	MAX_PLAN_SEMESTERS,
	MIN_PLAN_SEMESTERS,
} from '../utils/planSemester'

function PlanSemesterFields ({
	semesters,
	onCountChange,
	onDateChange,
	disabled = false,
	idPrefix = 'plan-semester',
}) {
	const rows = Array.isArray(semesters) ? semesters : []
	const count = rows.length || MIN_PLAN_SEMESTERS

	return (
		<div className='login-field'>
			<label
				className='login-label'
				htmlFor={`${idPrefix}-count`}
			>
				Número de semestres
			</label>
			<input
				type='number'
				id={`${idPrefix}-count`}
				name='numberOfSemesters'
				className='login-input'
				min={MIN_PLAN_SEMESTERS}
				max={MAX_PLAN_SEMESTERS}
				step={1}
				value={count}
				disabled={disabled}
				onChange={(e) => onCountChange(e.target.value)}
			/>
			<p className='school-grades-levels__hint'>
				Los cobros mensuales continúan hasta que termine el semestre
				actual. Los estudiantes eligen nuevas materias cuando comienza
				el siguiente semestre.
			</p>
			{rows.map((row, index) => {
				const n = index + 1
				return (
					<div
						key={`${idPrefix}-${index}`}
						className='plan-semester-block'
					>
						<span className='login-label'>
							Semestre {n}
						</span>
						<div className='plan-semester-row'>
							<div className='login-field'>
								<label
									className='login-label'
									htmlFor={`${idPrefix}-${index}-start`}
								>
									Fecha de inicio
								</label>
								<input
									type='date'
									id={`${idPrefix}-${index}-start`}
									name={`semester${n}StartDate`}
									className='login-input'
									value={row.startDate}
									disabled={disabled}
									onChange={(e) =>
										onDateChange(
											index,
											'startDate',
											e.target.value,
										)}
								/>
							</div>
							<div className='login-field'>
								<label
									className='login-label'
									htmlFor={`${idPrefix}-${index}-end`}
								>
									Fecha de fin
								</label>
								<input
									type='date'
									id={`${idPrefix}-${index}-end`}
									name={`semester${n}EndDate`}
									className='login-input'
									value={row.endDate}
									disabled={disabled}
									onChange={(e) =>
										onDateChange(
											index,
											'endDate',
											e.target.value,
										)}
								/>
							</div>
						</div>
					</div>
				)
			})}
		</div>
	)
}

export default PlanSemesterFields
