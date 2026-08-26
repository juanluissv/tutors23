import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import {
	useGetBookLessonsBySubjectForStudentQuery,
	useGetMySubjectsQuery,
} from '../../slices/student/studentApiSlice'
import { buildBookIndex } from '../../utils/buildBookIndex'
import '../../App.css'

const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/

const BOOK_INDEX_LABELS = {
	chapterFallback: (n) => `Capítulo ${n}`,
	pagesRange: (start, end) => `Páginas ${start}–${end}`,
	fromPage: (start) => `Desde la página ${start}`,
	throughPage: (end) => `Hasta la página ${end}`,
	otherChapters: 'Otros capítulos',
}

function StudentViewBookScreen () {
	const navigate = useNavigate()
	const { subjectId } = useParams()
	const { studentInfo } = useSelector((state) => state.authStudent)

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
	} = useGetMySubjectsQuery(undefined, {
		skip: !studentInfo,
	})

	const {
		data: bookLessons = [],
		isLoading: isLoadingLessons,
		isError: isLessonsError,
		refetch: refetchLessons,
	} = useGetBookLessonsBySubjectForStudentQuery(subjectId, {
		skip: !studentInfo || !isValidSubjectParam,
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
		() => buildBookIndex(
			bookChapters,
			lessonsByChapterId,
			BOOK_INDEX_LABELS,
		),
		[bookChapters, lessonsByChapterId],
	)

	const readyCount = rows.filter((row) => row.hasWebVersion).length
	const availableGroups = useMemo(
		() => groups.map((group) => ({
			...group,
			items: group.items.filter((item) => item.hasWebVersion),
		})).filter((group) => group.items.length > 0),
		[groups],
	)

	useEffect(() => {
		if (!studentInfo) {
			navigate('/students/login', { replace: true })
		}
	}, [studentInfo, navigate])

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	if (!studentInfo) {
		return null
	}

	if (!isValidSubjectParam) {
		return (
			<div className='chat-app'>
				<div className='main-container'>
					<Sidebar
						isOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div className='main-content'>
						<Header
							isSidebarOpen={isSidebarOpen}
							toggleSidebar={toggleSidebar}
						/>
						<div className='content-area content-area--login'>
							<div className='center-content2 login-screen login-screen--wide'>
								<div className='login-card'>
									<div className='login-card__accent' aria-hidden />
									<div className='login-card__header'>
										<h1 className='login-card__title'>
											Materia no válida
										</h1>
										<p className='login-card__back'>
											<Link
												to='/students/mysubjects'
												className='login-card__link'
											>
												← Volver a mis materias
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
			<div className='chat-app'>
				<div className='main-container'>
					<Sidebar
						isOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div className='main-content'>
						<Header
							isSidebarOpen={isSidebarOpen}
							toggleSidebar={toggleSidebar}
						/>
						<div className='content-area content-area--login'>
							<div className='center-content2 login-screen login-screen--wide'>
								<div className='login-card'>
									<div className='login-card__accent' aria-hidden />
									<div className='login-card__header'>
										<h1 className='login-card__title'>
											Materia no encontrada
										</h1>
										<p className='login-card__back'>
											<Link
												to='/students/mysubjects'
												className='login-card__link'
											>
												← Volver a mis materias
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
		: 'Materia'

	return (
		<div className='chat-app'>
			<div className='main-container'>
				<Sidebar
					isOpen={isSidebarOpen}
					toggleSidebar={toggleSidebar}
				/>
				<div className='main-content'>
					<Header
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div className={
						'content-area content-area--login ' +
						'content-area--login-scroll'
					}
					>
						<div className='center-content2 login-screen login-screen--wide'>
							<div className='login-card book-chapters view-book view-book--student'>
								<div className='login-card__accent' aria-hidden />
								<div className='login-card__header'>
									<p className='login-card__back'>
										<Link
											to='/students/mysubjects'
											className='login-card__link'
										>
											← Volver a mis materias
										</Link>
									</p>
									<h1 className='login-card__title'>
										Libro digital
									</h1>
									<p className={
										'login-card__subtitle ' +
										'login-card__subtitle--wide'
									}
									>
										Explora las lecciones web de{' '}
										<strong>{subjectTitle}</strong>. Los
										capítulos están ordenados como en el
										libro.
									</p>
								</div>

								{isSubjectsError || isLessonsError ? (
									<div className='book-chapters__alert'>
										<p className='book-chapters__alert-text'>
											No pudimos cargar el libro. Intenta
											de nuevo.
										</p>
										<button
											type='button'
											className='login-submit'
											onClick={() => {
												void refetchSubjects()
												void refetchLessons()
											}}
										>
											Reintentar
										</button>
									</div>
								) : null}

								<section
									className='view-book__summary'
									aria-label='Progreso del libro'
								>
									<div className='view-book__summary-card'>
										<p className='view-book__summary-label'>
											Lecciones disponibles
										</p>
										<p className='view-book__summary-value'>
											{readyCount}/{rows.length}
										</p>
										<p className='view-book__summary-hint'>
											{readyCount === 0
												? 'Tu docente aún no ha publicado lecciones web para esta materia.'
												: 'Abre cualquier capítulo para leer la lección.'}
										</p>
									</div>
								</section>

								{isLoadingSubjects || isLoadingLessons ? (
									<p className='book-chapters__loading'>
										Cargando libro…
									</p>
								) : readyCount === 0 ? (
									<div className='book-chapters__empty-chapters'>
										<p className='book-chapters__empty-chapters-title'>
											Aún no hay lecciones
										</p>
										<p className='book-chapters__empty-chapters-text'>
											Cuando tu docente genere las
											lecciones desde el libro, aparecerán
											aquí.
										</p>
									</div>
								) : (
									<div className='view-book__groups'>
										{availableGroups.map((group) => (
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
																<Link
																	to={
																		'/students/lessonpage/' +
																		`${row.lesson._id}`
																	}
																	className='view-book__lesson-link view-book__lesson-link--primary'
																>
																	Leer lección
																	<span
																		className='teacher-book-upload__open-link-icon'
																		aria-hidden
																	>
																		→
																	</span>
																</Link>
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

export default StudentViewBookScreen
