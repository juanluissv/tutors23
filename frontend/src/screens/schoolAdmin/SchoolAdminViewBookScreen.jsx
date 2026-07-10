import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import AdminSidebar from '../../components/AdminSidebar'
import AdminHeader from '../../components/AdminHeader'
import {
	useGetBookLessonsBySubjectQuery,
	useGetSubjectsBySchoolQuery,
} from '../../slices/admin/schoolAdminApiSlice'
import { buildBookIndex } from '../../utils/buildBookIndex'
import '../../App.css'

const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/

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

function SchoolAdminViewBookScreen () {
	const navigate = useNavigate()
	const { subjectId } = useParams()
	const { schoolAdminInfo } = useSelector((state) => state.authSchoolAdmin)
	const schoolId = schoolAdminInfo
		? resolveSchoolId(schoolAdminInfo.school)
		: null

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)

	const isValidSubjectParam =
		subjectId != null && OBJECT_ID_RE.test(String(subjectId))

	const {
		data: subjects = [],
		isLoading: isLoadingSubjects,
		isError: isSubjectsError,
		refetch: refetchSubjects,
	} = useGetSubjectsBySchoolQuery(schoolId, {
		skip: !schoolId,
	})

	const {
		data: bookLessons = [],
		isLoading: isLoadingLessons,
	} = useGetBookLessonsBySubjectQuery(subjectId, {
		skip: !isValidSubjectParam,
	})

	const currentSubject = useMemo(() => {
		if (!isValidSubjectParam || !subjects?.length) {
			return undefined
		}
		return subjects.find((s) => String(s._id) === String(subjectId))
	}, [subjects, subjectId, isValidSubjectParam])

	const bookChapters = useMemo(() => {
		if (!Array.isArray(currentSubject?.bookChapters)) {
			return []
		}
		return currentSubject.bookChapters
	}, [currentSubject])

	const lessonsByChapterId = useMemo(() => {
		const map = new Map()
		for (const lesson of bookLessons) {
			const chapterId = lesson?.bookChapter?.chapterId
			if (chapterId) {
				map.set(String(chapterId), lesson)
			}
		}
		return map
	}, [bookLessons])

	const { rows, groups } = useMemo(
		() => buildBookIndex(bookChapters, lessonsByChapterId),
		[bookChapters, lessonsByChapterId],
	)

	const readyCount = rows.filter((row) => row.hasWebVersion).length

	useEffect(() => {
		if (!schoolAdminInfo) {
			navigate('/schooladmins/login', { replace: true })
		}
	}, [schoolAdminInfo, navigate])

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	if (!schoolAdminInfo) {
		return null
	}

	if (!isValidSubjectParam) {
		return (
			<div className='chat-app chat-app--teacher-login ask-screen'>
				<div className='main-container'>
					<AdminSidebar
						isOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
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
											Invalid subject
										</h1>
										<p className='login-card__back'>
											<Link
												to='/schooladmins/mysubjects'
												className='login-card__link'
											>
												← Back to subjects
											</Link>
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

	if (!isLoadingSubjects && !currentSubject) {
		return (
			<div className='chat-app chat-app--teacher-login ask-screen'>
				<div className='main-container'>
					<AdminSidebar
						isOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
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
											Subject not found
										</h1>
										<p className='login-card__back'>
											<Link
												to='/schooladmins/mysubjects'
												className='login-card__link'
											>
												← Back to subjects
											</Link>
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

	const subjectTitle = currentSubject?.title
		? String(currentSubject.title)
		: 'Subject'

	return (
		<div className='chat-app chat-app--teacher-login ask-screen'>
			<div className='main-container'>
				<AdminSidebar
					isOpen={isSidebarOpen}
					toggleSidebar={toggleSidebar}
				/>
				<div className='main-content'>
					<AdminHeader
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div className={
						'content-area content-area--login ' +
						'content-area--login-scroll'
					}
					>
						<div className='center-content2 login-screen login-screen--wide'>
							<div className='login-card book-chapters view-book'>
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<p className='login-card__back'>
										<Link
											to={`/schooladmins/generatelessons/${subjectId}`}
											className='login-card__link'
										>
											← Back to generate lessons
										</Link>
									</p>
									<h1 className='login-card__title'>
										Web book index
									</h1>
									<p className={
										'login-card__subtitle ' +
										'login-card__subtitle--wide'
									}
									>
										Browse generated web versions of{' '}
										<strong>{subjectTitle}</strong>. Chapters
										are ordered by chapter number from the
										book setup.
									</p>
								</div>

								{isSubjectsError ? (
									<div className='book-chapters__alert'>
										<p className='book-chapters__alert-text'>
											We could not load this subject.
											Please try again.
										</p>
										<button
											type='button'
											className='login-submit'
											onClick={() => void refetchSubjects()}
										>
											Try again
										</button>
									</div>
								) : null}

								<section
									className='view-book__summary'
									aria-label='Book progress'
								>
									<div className='view-book__summary-card'>
										<p className='view-book__summary-label'>
											Web chapters ready
										</p>
										<p className='view-book__summary-value'>
											{readyCount}/{rows.length}
										</p>
										<p className='view-book__summary-hint'>
											{readyCount === 0
												? 'Generate lessons from chapter PDFs to unlock web links.'
												: 'Open any ready chapter to preview the student web lesson.'}
										</p>
									</div>
									<Link
										to={`/schooladmins/generatelessons/${subjectId}`}
										className='view-book__summary-link'
									>
										Manage generation →
									</Link>
								</section>

								{isLoadingSubjects || isLoadingLessons ? (
									<p className='book-chapters__loading'>
										Loading book index…
									</p>
								) : rows.length === 0 ? (
									<div className='book-chapters__empty-chapters'>
										<p className='book-chapters__empty-chapters-title'>
											No chapters yet
										</p>
										<p className='book-chapters__empty-chapters-text'>
											Define chapters on the book chapters
											page before building the web index.
										</p>
										<Link
											to={`/schooladmins/bookchapters/${subjectId}`}
											className='book-chapters__empty-chapters-link'
										>
											Go to book chapters
										</Link>
									</div>
								) : (
									<div className='view-book__groups'>
										{groups.map((group) => (
											<section
												key={
													group.unitNumber == null
														? 'other'
														: `unit-${group.unitNumber}`
												}
												className='view-book__group'
												aria-labelledby={
													`view-book-unit-${group.unitNumber ?? 'other'}`
												}
											>
												<h2
													id={
														`view-book-unit-${group.unitNumber ?? 'other'}`
													}
													className='view-book__group-title'
												>
													{group.label}
												</h2>
												<ol className='view-book__list'>
													{group.items.map((row) => (
														<li
															key={
																row.chapterId
																|| `chapter-${row.chapterNumber}`
															}
															className='view-book__item'
														>
															<div className='view-book__item-main'>
																<span className='view-book__item-num'>
																	{row.chapterNumber}
																</span>
																<div className='view-book__item-copy'>
																	<h3 className='view-book__item-title'>
																		{row.title}
																	</h3>
																	{row.heroSubtitle ? (
																		<p className='view-book__item-subtitle'>
																			{row.heroSubtitle}
																		</p>
																	) : null}
																	{row.pageLabel ? (
																		<p className='view-book__item-meta'>
																			{row.pageLabel}
																		</p>
																	) : null}
																</div>
															</div>
															<div className='view-book__item-actions'>
																{row.hasWebVersion ? (
																	<Link
																		to={
																			'/schooladmins/lessonpage/' +
																			`${subjectId}/${row.lesson._id}`
																		}
																		className='view-book__lesson-link'
																		target='_blank'
																		rel='noopener noreferrer'
																	>
																		Open web lesson
																		<span
																			className='teacher-book-upload__open-link-icon'
																			aria-hidden
																		>
																			↗
																		</span>
																	</Link>
																) : (
																	<span className='view-book__pending'>
																		Not generated yet
																	</span>
																)}
															</div>
														</li>
													))}
												</ol>
											</section>
										))}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default SchoolAdminViewBookScreen
