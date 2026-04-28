import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { useCreateSubjectMutation } from '../../slices/admin/schoolAdminApiSlice'
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

function SchoolAdminCreateSubjectScreen () {
	const navigate = useNavigate()
	const { schoolAdminInfo } = useSelector((state) => state.authSchoolAdmin)
	const schoolId = schoolAdminInfo
		? resolveSchoolId(schoolAdminInfo.school)
		: null

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [title, setTitle] = useState('')
	const [grade, setGrade] = useState('')
	const [description, setDescription] = useState('')
	const [isCoursePublish, setIsCoursePublish] = useState(false)

	const [createSubject, { isLoading }] = useCreateSubjectMutation()

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
		if (title.trim() === '') {
			toast.error('Please enter the subject title')
			return
		}
		if (!schoolId) {
			return
		}

		const body = {
			title: title.trim(),
			school: schoolId,
			isCoursePublish,
		}
		if (grade.trim() !== '') {
			const n = Number(grade)
			if (Number.isNaN(n)) {
				toast.error('Please enter a valid number for grade')
				return
			}
			body.grade = n
		}
		if (description.trim() !== '') {
			body.description = description.trim()
		}

		try {
			await createSubject(body).unwrap()
			toast.success('Subject created')
			navigate('/schooladmins/myschools', { replace: true })
		} catch (err) {
			toast.error(
				err?.data?.message
					|| err?.error?.message
					|| 'Could not create subject',
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
											add subjects.
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
					<div className='content-area content-area--login'>
						<div className='center-content2 login-screen login-screen--wide'>
							<div className='login-card'>
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<h1 className='login-card__title'>
										<br />
										Create a subject
									</h1>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Add a new subject to your school. You can
										set a grade level, add a short description,
										and choose whether to publish it as a
										course.
									</p>
								</div>
								<form
									className='login-form'
									id='schooladmin-create-subject-form'
									name='schooladmin-create-subject-form'
									onSubmit={handleSubmit}
								>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='schooladmin-create-subject-title'
										>
											Subject title
										</label>
										<input
											type='text'
											id='schooladmin-create-subject-title'
											name='title'
											className='login-input'
											placeholder='e.g. Algebra II'
											autoComplete='off'
											value={title}
											disabled={isLoading}
											onChange={(e) => setTitle(e.target.value)}
										/>
									</div>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='schooladmin-create-subject-grade'
										>
											Grade (optional)
										</label>
										<input
											type='number'
											id='schooladmin-create-subject-grade'
											name='grade'
											className='login-input'
											placeholder='e.g. 9'
											min={0}
											step='any'
											autoComplete='off'
											value={grade}
											disabled={isLoading}
											onChange={(e) => setGrade(e.target.value)}
										/>
									</div>
									<div className='login-field'>
										<label
											className='login-label'
											htmlFor='schooladmin-create-subject-description'
										>
											Description (optional)
										</label>
										<textarea
											id='schooladmin-create-subject-description'
											name='description'
											className='login-input login-textarea'
											placeholder='What this subject covers…'
											rows={4}
											value={description}
											disabled={isLoading}
											onChange={(e) =>
												setDescription(e.target.value)}
										/>
									</div>
									<div className='login-field login-field--row'>
										<label
											className='login-remember'
											htmlFor='schooladmin-create-subject-publish'
										>
											<input
												type='checkbox'
												id='schooladmin-create-subject-publish'
												name='isCoursePublish'
												className='login-checkbox'
												checked={isCoursePublish}
												disabled={isLoading}
												onChange={(e) =>
													setIsCoursePublish(
														e.target.checked,
													)}
											/>
											<span className='login-remember__text'>
												Publish as course
											</span>
										</label>
									</div>
									<button
										type='submit'
										id='schooladmin-create-subject-submit'
										className='login-submit'
										disabled={isLoading}
									>
										{isLoading ? 'Creating…' : 'Create subject'}
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

export default SchoolAdminCreateSubjectScreen
