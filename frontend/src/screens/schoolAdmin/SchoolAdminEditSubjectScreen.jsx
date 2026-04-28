import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
	useGetSubjectsBySchoolQuery,
	useUpdateSubjectMutation,
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

function SchoolAdminEditSubjectScreen () {
	const { id: subjectId } = useParams()
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

	const {
		data: subjects = [],
		isLoading: isLoadingList,
		isError: isListError,
		refetch: refetchSubjects,
	} = useGetSubjectsBySchoolQuery(schoolId, {
		skip: !schoolId,
	})

	const [updateSubject, { isLoading: isSaving }] = useUpdateSubjectMutation()

	const isValidSubjectParam =
		subjectId != null && OBJECT_ID_RE.test(String(subjectId))

	const currentSubject = useMemo(() => {
		if (!isValidSubjectParam || !subjects?.length) {
			return undefined
		}
		return subjects.find((s) => String(s._id) === String(subjectId))
	}, [subjects, subjectId, isValidSubjectParam])

	const isBusy = isLoadingList || isSaving

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	useEffect(() => {
		if (!schoolAdminInfo) {
			navigate('/schooladmins/login', { replace: true })
		}
	}, [schoolAdminInfo, navigate])

	useEffect(() => {
		if (!currentSubject) {
			return
		}
		setTitle(currentSubject.title ?? '')
		setDescription(currentSubject.description ?? '')
		setIsCoursePublish(Boolean(currentSubject.isCoursePublish))
		setGrade(
			currentSubject.grade != null && !Number.isNaN(Number(currentSubject.grade))
				? String(currentSubject.grade)
				: '',
		)
	}, [currentSubject])

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (title.trim() === '') {
			toast.error('Please enter a subject title')
			return
		}
		if (!isValidSubjectParam) {
			return
		}

		const body = {
			id: String(subjectId),
			title: title.trim(),
			isCoursePublish,
		}
		if (description !== '') {
			body.description = description.trim()
		} else {
			body.description = ''
		}
		if (grade.trim() !== '') {
			const n = Number(grade)
			if (Number.isNaN(n)) {
				toast.error('Please enter a valid number for grade')
				return
			}
			body.grade = n
		} else {
			body.grade = null
		}

		try {
			await updateSubject(body).unwrap()
			toast.success('Subject updated')
			navigate('/schooladmins/mysubjects', { replace: true })
		} catch (err) {
			toast.error(
				err?.data?.message
					|| err?.error?.message
					|| 'Could not update subject',
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
											edit subjects.
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
										Edit subject
									</h1>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Update how this subject appears in your
										school. Change the title, grade, description,
										or course visibility.
									</p>
									{isValidSubjectParam ? (
										<div className='login-card__invite-cta'>
											<Link
												to={`/schooladmins/teacherinvite/${subjectId}`}
												className='login-card__invite-cta-link'
											>
												<span className='login-card__invite-cta-label'>
													Invite a teacher
												</span>
												<span
													className='login-card__invite-cta-arrow'
													aria-hidden
												>
													→
												</span>
											</Link>
											<p className='login-card__invite-cta-sub'>
												Set or change the email for the teacher
												assigned to this subject.
											</p>
										</div>
									) : null}
								</div>
								{isLoadingList && !currentSubject ? (
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Loading…
									</p>
								) : (
									<form
										className='login-form'
										id='schooladmin-edit-subject-form'
										name='schooladmin-edit-subject-form'
										onSubmit={handleSubmit}
									>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='schooladmin-edit-subject-title'
											>
												Subject name
											</label>
											<input
												type='text'
												id='schooladmin-edit-subject-title'
												name='title'
												className='login-input'
												placeholder='e.g. Algebra I'
												autoComplete='off'
												value={title}
												disabled={isBusy}
												onChange={(e) => setTitle(e.target.value)}
											/>
										</div>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='schooladmin-edit-subject-grade'
											>
												Grade (optional)
											</label>
											<input
												type='number'
												id='schooladmin-edit-subject-grade'
												name='grade'
												className='login-input'
												placeholder='e.g. 9'
												min={0}
												step='any'
												autoComplete='off'
												value={grade}
												disabled={isBusy}
												onChange={(e) => setGrade(e.target.value)}
											/>
										</div>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='schooladmin-edit-subject-description'
											>
												Description (optional)
											</label>
											<textarea
												id='schooladmin-edit-subject-description'
												name='description'
												className='login-input login-textarea'
												placeholder='What will students learn? Who is it for?'
												rows={5}
												value={description}
												disabled={isBusy}
												onChange={(e) =>
													setDescription(e.target.value)}
											/>
										</div>
										<div className='login-field login-field--row'>
											<label
												className='login-remember'
												htmlFor='schooladmin-edit-subject-publish'
											>
												<input
													type='checkbox'
													id='schooladmin-edit-subject-publish'
													name='isCoursePublish'
													className='login-checkbox'
													checked={isCoursePublish}
													disabled={isBusy}
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
											id='schooladmin-edit-subject-save'
											className='login-submit'
											disabled={isBusy}
										>
											{isSaving ? 'Saving…' : 'Save changes'}
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

export default SchoolAdminEditSubjectScreen
