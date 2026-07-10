import React from 'react'

const Loader = ({ size = 'lg', className = '' }) => {
	const rootClass = ['loader', className].filter(Boolean).join(' ')

	return (
		<div className={rootClass} role='status' aria-label='Loading'>
			<div
				className={`loader__spinner loader__spinner--${size}`}
				aria-hidden
			/>
			<span className='loader__sr-only'>Loading…</span>
		</div>
	)
}

export default Loader
