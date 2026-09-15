import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { useCreateSchoolMutation } from '../../slices/admin/schoolAdminApiSlice'
import { setSchoolAdminCredentials } from '../../slices/admin/authSchoolAdminSlice'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import '../../App.css'

const SCHOOL_TYPE_OPTIONS = [
	{ value: 'primary', label: 'Primaria' },
	{ value: 'secondary', label: 'Secundaria' },
	{ value: 'high_school', label: 'Bachillerato' },
	{ value: 'university', label: 'Universidad' },
]

function SchoolAdminRegisterSchoolScreen () {
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const { schoolAdminInfo } = useSelector((state) => state.authSchoolAdmin)

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [name, setName] = useState('')
	const [schoolType, setSchoolType] = useState('')
	const [country, setCountry] = useState('')
	const [city, setCity] = useState('')
	const [address, setAddress] = useState('')

	const [createSchool, { isLoading }] = useCreateSchoolMutation()

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	useEffect(() => {
		if (!schoolAdminInfo) {
			navigate('/schooladmins/login', { replace: true })
		}
	}, [schoolAdminInfo, navigate])

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (name.trim() === '') {
			toast.error('Por favor ingresa el nombre de la escuela')
			return
		}
		if (country.trim() === '') {
			toast.error('Por favor ingresa el país')
			return
		}
		if (city.trim() === '') {
			toast.error('Por favor ingresa la ciudad')
			return
		}
		if (schoolType.trim() === '') {
			toast.error('Por favor selecciona el tipo de escuela')
			return
		}

		const body = {
			name: name.trim(),
			schoolType,
			country: country.trim(),
			city: city.trim(),
			address: address.trim(),
		}

		try {
			const res = await createSchool(body).unwrap()
			dispatch(
				setSchoolAdminCredentials({
					...schoolAdminInfo,
					school: res._id,
				}),
			)
			toast.success('Escuela creada')
			navigate('/schooladmins/myschools', { replace: true })
		} catch (err) {
			toast.error(
				err?.data?.message
					|| err?.error?.message
					|| 'No se pudo crear la escuela',
			)
		}
	}

	if (!schoolAdminInfo) {
		return null
	}

	if (schoolAdminInfo.school) {
		return (
			<div className='chat-app chat-app--teacher-login ask-screen'>
				<div className='main-container'>
					<AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
					<div className='main-content'>
						<AdminHeader
							isSidebarOpen={isSidebarOpen}
							toggleSidebar={toggleSidebar}
						/>
						<div className='content-area content-area--login'>
							<div className='center-content2 login-screen login-screen--wide'>
								<div className='login-card'>
									<div className='login-card__accent' aria-hidden />
									<div className='login-card__header'>
										<h1 className='login-card__title'>
											<br /><br /><br /><br />
											Escuela ya registrada
										</h1>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											Tu cuenta ya está vinculada a una
											escuela. Actualiza tu perfil o
											contacta a soporte si necesitas
											hacer cambios.
										</p>
									</div>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										<Link to='/schooladmins/profile'>
											Ir a tu perfil
										</Link>
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className='chat-app chat-app--teacher-login ask-screen'>
			<div className='main-container'>
				<AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
				<div className='main-content'>
					<AdminHeader
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div className='content-area content-area--login'>
						<div className='center-content2 login-screen login-screen--wide'>
							<div className='login-card'>
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<h1 className='login-card__title'>
										<br /><br /><br /><br />
										Registra tu escuela
									</h1>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Agrega tu institución para administrar
										profesores, estudiantes y materias
										desde tu panel.
									</p>
								</div>
								<form
									className='login-form'
									id='schooladmin-register-school-form'
									name='schooladmin-register-school-form'
									onSubmit={handleSubmit}
								>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='schooladmin-register-school-name'
										>
											Nombre de la escuela
										</label>
										<input
											type='text'
											id='schooladmin-register-school-name'
											name='name'
											className='login-input'
											placeholder='p. ej. Instituto Nacional'
											autoComplete='organization'
											value={name}
											required
											disabled={isLoading}
											onChange={(e) => setName(e.target.value)}
										/>
									</div>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='schooladmin-register-school-type'
										>
											Tipo de escuela
										</label>
										<select
											id='schooladmin-register-school-type'
											name='schoolType'
											className='login-input'
											value={schoolType}
											required
											disabled={isLoading}
											onChange={(e) =>
												setSchoolType(e.target.value)}
										>
											<option value=''>
												Selecciona el tipo de escuela
											</option>
											{SCHOOL_TYPE_OPTIONS.map((opt) => (
												<option
													key={opt.value}
													value={opt.value}
												>
													{opt.label}
												</option>
											))}
										</select>
									</div>
									<div className='tp-row'>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='schooladmin-register-school-country'
											>
												País
											</label>
											<input
												type='text'
												id='schooladmin-register-school-country'
												name='country'
												className='login-input'
												placeholder='País'
												autoComplete='country-name'
												value={country}
												required
												disabled={isLoading}
												onChange={(e) =>
													setCountry(e.target.value)}
											/>
										</div>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='schooladmin-register-school-city'
											>
												Ciudad
											</label>
											<input
												type='text'
												id='schooladmin-register-school-city'
												name='city'
												className='login-input'
												placeholder='Ciudad'
												autoComplete='address-level2'
												value={city}
												required
												disabled={isLoading}
												onChange={(e) =>
													setCity(e.target.value)}
											/>
										</div>
									</div>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='schooladmin-register-school-address'
										>
											Dirección
										</label>
										<input
											type='text'
											id='schooladmin-register-school-address'
											name='address'
											className='login-input'
											placeholder='Calle, número, colonia…'
											autoComplete='street-address'
											value={address}
											disabled={isLoading}
											onChange={(e) =>
												setAddress(e.target.value)}
										/>
									</div>
									<button
										type='submit'
										id='schooladmin-register-school-submit'
										className='login-submit'
										disabled={isLoading}
									>
										{isLoading
											? 'Creando…'
											: 'Crear escuela'}
									</button>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default SchoolAdminRegisterSchoolScreen
