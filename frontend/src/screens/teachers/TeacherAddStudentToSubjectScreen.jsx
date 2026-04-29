import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import TeacherSidebar from '../../components/TeacherSidebar'
import TeacherHeader from '../../components/TeacherHeader'
import {
	useAddStudentEmailToSubjectMutation,
	useGetSubjectsByTeacherIdQuery,
} from '../../slices/teachers/teacherApiSlice'
import '../../App.css'

const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/

function TeacherAddStudentToSubjectScreen () {
	const { id: subjectId } = useParams()
	const navigate = useNavigate()
	const { teacherInfo } = useSelector((state) => state.authTeacher)
	const teacherIdStr = teacherInfo?._id
		? String(teacherInfo._id)
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
	} = useGetSubjectsByTeacherIdQuery(teacherIdStr, {
		skip: !teacherIdStr,
	})

	const [addStudentEmail, { isLoading: isSaving }] =
		useAddStudentEmailToSubjectMutation()

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
		if (!teacherInfo) {
			navigate('/teachers/login', { replace: true })
		}
	}, [teacherInfo, navigate])

	const handleSubmit = async (e) => {
		e.preventDefault()
		if (email.trim() === '') {
			toast.error('Please enter the student email')
			return
		}
		if (!isValidSubjectParam || !teacherIdStr) {
			return
		}

		try {
			await addStudentEmail({
				subjectId: String(subjectId),
				teacherId: teacherIdStr,
				email: email.trim(),
			}).unwrap()
			toast.success('Student email added')
			navigate(`/teachers/students/`, { replace: true })
		} catch (err) {
			toast.error(
				err?.data?.message
					|| err?.error?.message
					|| 'Could not add student email',
			)
		}
	}

	if (!teacherInfo) {
		return null
	}

	if (!isValidSubjectParam) {
		return (
			<div className='chat-app chat-app--login chat-app--teacher-login ask-screen'>
				<div className='main-container'>
					<TeacherSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
					<div className='main-content'>
						<TeacherHeader
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
												to='/teachers/students'
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
					<TeacherSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
					<div className='main-content'>
						<TeacherHeader
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
												to='/teachers/students'
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
					<TeacherSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
					<div className='main-content'>
						<TeacherHeader
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
												to='/teachers/students'
												className='login-card__link'
											>
												← Back to subjects
											</Link>
										</div>
										<h1 className='login-card__title'>Subject not found</h1>
										<p className='login-card__subtitle login-card__subtitle--wide'>
											There is no subject with this id in your
											assignments, or it may have been removed.
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
				<TeacherSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
				<div className='main-content'>
					<TeacherHeader
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
											to={`/teachers/students/${subjectId}`}
											className='login-card__link'
										>
											← Back to students
										</Link>
									</div>
									<h1 className='login-card__title'>
										Add student by email
									</h1>
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Add the email for a student taking{' '}
										<strong>
											{currentSubject?.title || 'this subject'}
										</strong>
										. Duplicate emails are ignored.
									</p>
								</div>
								{isLoadingList && !currentSubject ? (
									<p className='login-card__subtitle login-card__subtitle--wide'>
										Loading…
									</p>
								) : (
									<form
										className='login-form'
										id='teacher-add-student-form'
										name='teacher-add-student-form'
										onSubmit={handleSubmit}
									>
										<div className='login-field'>
											<label
												className='login-label'
												htmlFor='teacher-add-student-email'
											>
												Student email
											</label>
											<input
												type='email'
												id='teacher-add-student-email'
												name='email'
												className='login-input'
												placeholder='student@school.edu'
												autoComplete='email'
												value={email}
												disabled={isBusy}
												onChange={(e) => setEmail(e.target.value)}
											/>
										</div>
										<button
											type='submit'
											id='teacher-add-student-submit'
											className='login-submit'
											disabled={isBusy}
										>
											{isSaving ? 'Adding…' : 'Add student'}
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

export default TeacherAddStudentToSubjectScreen
