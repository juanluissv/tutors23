import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
	useAddTeacherToSchoolMutation,
	useGetTeachersBySchoolQuery,
} from '../../slices/admin/schoolAdminApiSlice'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import '../../App.css'

function resolveSchoolId (school) {
	if (!school) {
		return null
	}
	if (typeof school === 'string') {
		return school
	}
	if (typeof school === 'object' && school._id) {
		return String(school._id)
	}
	return null
}

function formatNamePart (value) {
	if (!value) {
		return ''
	}
	const trimmed = String(value).trim()
	if (trimmed === '') {
		return ''
	}
	return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

function formatTeacherName (firstname, lastname) {
	return [
		formatNamePart(firstname),
		formatNamePart(lastname),
	].filter(Boolean).join(' ')
}

function teacherInitials (firstname, lastname) {
	const first = formatNamePart(firstname).charAt(0)
	const last = formatNamePart(lastname).charAt(0)
	return (first + last) || '?'
}

function SchoolAdminAddTeacherScreen () {
	const navigate = useNavigate()
	const { schoolAdminInfo } = useSelector((state) => state.authSchoolAdmin)
	const schoolId = schoolAdminInfo
		? resolveSchoolId(schoolAdminInfo.school)
		: null

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [firstname, setFirstname] = useState('')
	const [lastname, setLastname] = useState('')
	const [email, setEmail] = useState('')

	const {
		data: teachers = [],
		isLoading: isLoadingTeachers,
		isError: isTeachersError,
		refetch: refetchTeachers,
	} = useGetTeachersBySchoolQuery(schoolId, {
		skip: !schoolId,
	})

	const [addTeacher, { isLoading: isSaving }] = useAddTeacherToSchoolMutation()

	const teachersList = Array.isArray(teachers) ? teachers : []

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
		if (!schoolId) {
			return
		}
		if (firstname.trim() === '') {
			toast.error('Please enter the teacher first name')
			return
		}
		if (lastname.trim() === '') {
			toast.error('Please enter the teacher last name')
			return
		}
		if (email.trim() === '') {
			toast.error('Please enter the teacher email')
			return
		}

		try {
			await addTeacher({
				schoolId,
				firstname: firstname.trim(),
				lastname: lastname.trim(),
				email: email.trim(),
			}).unwrap()
			toast.success('Teacher added to your school')
			setFirstname('')
			setLastname('')
			setEmail('')
		} catch (err) {
			toast.error(
				err?.data?.message
					|| err?.error?.message
					|| 'Could not add teacher',
			)
		}
	}

	if (!schoolAdminInfo) {
		return null
	}

	if (!schoolId) {
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
											<br />
											No school yet
										</h1>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											Register your school first, then you can
											add teachers.
										</p>
									</div>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										<Link to='/schooladmins/registerschool'>
											Register your school
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
					<div className='content-area content-area--login content-area--login-scroll'>
					<div className='center-content2 login-screen login-screen--wide'>
							<div className='login-card'>
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<h1 className='login-card__title'>
										<br />
										Add a teacher
									</h1>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Enter the teacher&apos;s name and email to
										add them to your school. They can sign up or
										log in later with this email.
									</p>
								</div>

								<section
									className='school-teachers-roster'
									aria-label='Teachers already in your school'
								>
									<div className='school-teachers-roster__header'>
										<h2 className='school-teachers-roster__title'>
											Teachers in your school
										</h2>
										{!isLoadingTeachers && !isTeachersError && (
											<span
												className='school-teachers-roster__count'
												aria-label={`${teachersList.length} teachers`}
											>
												{teachersList.length}
											</span>
										)}
									</div>

									{isLoadingTeachers && (
										<p className='school-teachers-roster__status'>
											Loading teachers…
										</p>
									)}

									{isTeachersError && !isLoadingTeachers && (
										<div className='school-teachers-roster__empty'>
											<p className='school-teachers-roster__status'>
												Could not load your teachers.
											</p>
											<button
												type='button'
												className='login-submit'
												style={{ marginTop: '0.75rem' }}
												onClick={() => void refetchTeachers()}
											>
												Try again
											</button>
										</div>
									)}

									{!isLoadingTeachers
										&& !isTeachersError
										&& teachersList.length === 0 && (
										<p className='school-teachers-roster__empty'>
											No teachers added yet. Use the form below
											to add your first teacher.
										</p>
									)}

									{!isLoadingTeachers
										&& !isTeachersError
										&& teachersList.length > 0 && (
										<ul className='school-teachers-roster__list'>
											{teachersList.map((teacher) => {
												const id = String(
													teacher._id ?? teacher.email,
												)
												const displayName = formatTeacherName(
													teacher.firstname,
													teacher.lastname,
												)

												return (
													<li
														key={id}
														className='school-teachers-roster__item'
													>
														<div
															className='school-teachers-roster__avatar'
															aria-hidden='true'
														>
															{teacherInitials(
																teacher.firstname,
																teacher.lastname,
															)}
														</div>
														<div className='school-teachers-roster__info'>
															<span className='school-teachers-roster__name'>
																{displayName}
															</span>
															<span className='school-teachers-roster__email'>
																{teacher.email}
															</span>
														</div>
													</li>
												)
											})}
										</ul>
									)}
								</section>

								<form
									className='login-form'
									id='schooladmin-add-teacher-form'
									name='schooladmin-add-teacher-form'
									onSubmit={handleSubmit}
								>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='schooladmin-add-teacher-firstname'
										>
											First name
										</label>
										<input
											type='text'
											id='schooladmin-add-teacher-firstname'
											name='firstname'
											className='login-input'
											placeholder='e.g. Maria'
											autoComplete='given-name'
											value={firstname}
											required
											disabled={isSaving}
											onChange={(e) =>
												setFirstname(e.target.value)}
										/>
									</div>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='schooladmin-add-teacher-lastname'
										>
											Last name
										</label>
										<input
											type='text'
											id='schooladmin-add-teacher-lastname'
											name='lastname'
											className='login-input'
											placeholder='e.g. Garcia'
											autoComplete='family-name'
											value={lastname}
											required
											disabled={isSaving}
											onChange={(e) =>
												setLastname(e.target.value)}
										/>
									</div>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='schooladmin-add-teacher-email'
										>
											Email
										</label>
										<input
											type='email'
											id='schooladmin-add-teacher-email'
											name='email'
											className='login-input'
											placeholder='teacher@school.edu'
											autoComplete='email'
											value={email}
											required
											disabled={isSaving}
											onChange={(e) => setEmail(e.target.value)}
										/>
									</div>
									<button
										type='submit'
										id='schooladmin-add-teacher-submit'
										className='login-submit'
										disabled={isSaving}
									>
										{isSaving ? 'Adding…' : 'Add teacher'}
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

export default SchoolAdminAddTeacherScreen
