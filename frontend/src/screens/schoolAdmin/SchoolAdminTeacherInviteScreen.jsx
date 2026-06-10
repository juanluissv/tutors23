import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
	useGetSubjectsBySchoolQuery,
	useSetSubjectTeacherEmailMutation,
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

const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/

function normalizeTeacherEmails (teacherEmail) {
	if (teacherEmail == null || teacherEmail === '') {
		return []
	}
	if (Array.isArray(teacherEmail)) {
		return teacherEmail
			.map((e) => String(e).trim())
			.filter((e) => e !== '')
	}
	const single = String(teacherEmail).trim()
	return single !== '' ? [single] : []
}

function SchoolAdminTeacherInviteScreen () {
	const { id: subjectId } = useParams()
	const navigate = useNavigate()
	const { schoolAdminInfo } = useSelector((state) => state.authSchoolAdmin)
	const schoolId = schoolAdminInfo
		? resolveSchoolId(schoolAdminInfo.school)
		: null

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [email, setEmail] = useState('')

	const {
		data: subjects = [],
		isLoading: isLoadingList,
		isError: isListError,
		refetch: refetchSubjects,
	} = useGetSubjectsBySchoolQuery(schoolId, {
		skip: !schoolId,
	})

	const [setSubjectTeacherEmail, { isLoading: isSaving }] =
		useSetSubjectTeacherEmailMutation()

	const isValidSubjectParam =
		subjectId != null && OBJECT_ID_RE.test(String(subjectId))

	const currentSubject = useMemo(() => {
		if (!isValidSubjectParam || !subjects?.length) {
			return undefined
		}
		return subjects.find((s) => String(s._id) === String(subjectId))
	}, [subjects, subjectId, isValidSubjectParam])

	const savedTeacherEmails = useMemo(
		() => normalizeTeacherEmails(currentSubject?.teacherEmail),
		[currentSubject],
	)

	const isBusy = isLoadingList || isSaving

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
		const trimmed = email.trim().toLowerCase()
		if (trimmed === '') {
			toast.error('Please enter the teacher email')
			return
		}
		if (!isValidSubjectParam) {
			return
		}
		if (
			savedTeacherEmails.some(
				(saved) => saved.toLowerCase() === trimmed,
			)
		) {
			toast.error('That email is already saved for this subject')
			return
		}

		try {
			await setSubjectTeacherEmail({
				id: String(subjectId),
				email: trimmed,
			}).unwrap()
			toast.success('Teacher email saved')
			navigate('/schooladmins/mysubjects', { replace: true })
		} catch (err) {
			toast.error(
				err?.data?.message
					|| err?.error?.message
					|| 'Could not save teacher email',
			)
		}
	}

	if (!schoolAdminInfo) {
		return null
	}

	if (!schoolId) {
		return (
			<div className='chat-app chat-app--login chat-app--teacher-login ask-screen'>
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
											invite teachers to subjects.
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

	if (!isValidSubjectParam) {
		return (
			<div className='chat-app chat-app--login chat-app--teacher-login ask-screen'>
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
										<div className='login-card__back'>
											<Link
												to='/schooladmins/mysubjects'
												className='login-card__link'
											>
												← Back to subjects
											</Link>
										</div>
										<h1 className='login-card__title'>Invalid link</h1>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											This subject link is not valid.
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (isListError) {
		return (
			<div className='chat-app chat-app--login chat-app--teacher-login ask-screen'>
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
										<div className='login-card__back'>
											<Link
												to='/schooladmins/mysubjects'
												className='login-card__link'
											>
												← Back to subjects
											</Link>
										</div>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											We couldn&apos;t load subjects.
										</p>
									</div>
									<button
										type='button'
										className='login-submit'
										onClick={() => void refetchSubjects()}
									>
										Try again
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (!isLoadingList && !currentSubject) {
		return (
			<div className='chat-app chat-app--login chat-app--teacher-login ask-screen'>
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
										<div className='login-card__back'>
											<Link
												to='/schooladmins/mysubjects'
												className='login-card__link'
											>
												← Back to subjects
											</Link>
										</div>
										<h1 className='login-card__title'>Subject not found</h1>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											There is no subject with this id in your
											school, or it may have been removed.
										</p>
									</div>
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
									<div className='login-card__back'>
										<Link
											to='/schooladmins/mysubjects'
											className='login-card__link'
										>
											← Back to subjects
										</Link>
									</div>
									<h1 className='login-card__title'>
										Add a teacher to this subject
									</h1>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Add teacher emails for
										<strong> {currentSubject?.title || 'this subject'}</strong>
										. Saved invites appear below; you can add
										more at any time.
									</p>
								</div>
								{isLoadingList && !currentSubject ? (
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Loading…
									</p>
								) : (
									<form
										className='login-form'
										id='schooladmin-teacher-invite-form'
										name='schooladmin-teacher-invite-form'
										onSubmit={handleSubmit}
									>
										<div className='subject-teacher-emails'>
											<p className='subject-teacher-emails__label'>
												Saved teacher emails
											</p>
											{savedTeacherEmails.length > 0 ? (
												<ul
													className='subject-teacher-emails__list'
													aria-label='Saved teacher emails for this subject'
												>
													{savedTeacherEmails.map(
														(savedEmail) => (
															<li
																key={savedEmail}
																className='subject-teacher-emails__item'
															>
																{savedEmail}
															</li>
														),
													)}
												</ul>
											) : (
												<p className='subject-teacher-emails__empty'>
													No teacher emails saved yet
													for this subject.
												</p>
											)}
										</div>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='schooladmin-teacher-invite-email'
											>
												Add teacher email
											</label>
											<input
												type='email'
												id='schooladmin-teacher-invite-email'
												name='email'
												className='login-input'
												placeholder='teacher@school.edu'
												autoComplete='email'
												value={email}
												disabled={isBusy}
												onChange={(e) => setEmail(e.target.value)}
											/>
										</div>
										<button
											type='submit'
											id='schooladmin-teacher-invite-save'
											className='login-submit'
											disabled={isBusy}
										>
											{isSaving ? 'Saving…' : 'Add email'}
										</button>
									</form>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default SchoolAdminTeacherInviteScreen
