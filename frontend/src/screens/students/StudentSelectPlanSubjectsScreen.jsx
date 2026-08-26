import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import {
	useGetAvailableSubscriptionSubjectsQuery,
	useGetProfileQuery,
	useSelectSubscriptionSubjectsMutation,
} from '../../slices/student/studentApiSlice'
import { setStudentCredentials } from '../../slices/student/authStudentSlice'
import { getSubjectProgramsLabel } from '../../utils/universityProgram'
import '../../App.css'

function resolveActiveSubscription (subscriptions, subscriptionId) {
	const list = Array.isArray(subscriptions) ? subscriptions : []
	return list.find(
		(sub) => String(sub?._id) === String(subscriptionId),
	) ?? null
}

function StudentSelectPlanSubjectsScreen () {
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const { subscriptionId } = useParams()
	const { studentInfo } = useSelector((state) => state.authStudent)

	const [isSidebarOpen, setIsSidebarOpen] = useState(
		window.innerWidth > 768,
	)
	const [selectedSubjectIds, setSelectedSubjectIds] = useState([])

	const {
		data: profile,
		isLoading: isLoadingProfile,
		refetch: refetchProfile,
	} = useGetProfileQuery(undefined, {
		skip: !studentInfo,
	})

	const subscription = useMemo(
		() => resolveActiveSubscription(
			profile?.subscriptions,
			subscriptionId,
		),
		[profile?.subscriptions, subscriptionId],
	)

	const {
		data: availableData,
		isLoading: isLoadingSubjects,
		isError: isSubjectsError,
		error: subjectsError,
	} = useGetAvailableSubscriptionSubjectsQuery(subscriptionId, {
		skip: !studentInfo || !subscriptionId || !subscription,
	})

	const [selectSubjects, { isLoading: isSaving }] =
		useSelectSubscriptionSubjectsMutation()

	const maxSubjects = Number(availableData?.maxSubjects) || 5
	const semesterIndex = Number(
		availableData?.currentSemesterIndex
			?? subscription?.currentSemesterIndex,
	) || 0
	const semesterCount = Array.isArray(subscription?.semesters)
		? subscription.semesters.length
		: 0
	const semesterLabel = semesterCount > 0
		? `Semester ${semesterIndex + 1} of ${semesterCount}`
		: ''
	const subjects = useMemo(
		() => (Array.isArray(availableData?.subjects)
			? availableData.subjects
			: []),
		[availableData?.subjects],
	)

	const programName = useMemo(() => {
		const program = availableData?.program ?? subscription?.plan?.program
		return getSubjectProgramsLabel(program, 'your program')
	}, [availableData?.program, subscription?.plan?.program])

	useEffect(() => {
		if (!studentInfo) {
			const next = encodeURIComponent(
				`/students/select-subjects/${subscriptionId ?? ''}`,
			)
			navigate(`/login?redirect=${next}`, { replace: true })
		}
	}, [studentInfo, navigate, subscriptionId])

	useEffect(() => {
		if (
			subscription
			&& subscription.needsSubjectSelection === false
			&& (subscription.selectedSubjects?.length ?? 0) > 0
		) {
			navigate('/students/profile', { replace: true })
		}
	}, [subscription, navigate])

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen)
	}

	const handleToggleSubject = (subjectId) => {
		const id = String(subjectId)
		setSelectedSubjectIds((prev) => {
			if (prev.includes(id)) {
				return prev.filter((item) => item !== id)
			}
			if (prev.length >= maxSubjects) {
				toast.error(`You can select up to ${maxSubjects} subjects`)
				return prev
			}
			return [...prev, id]
		})
	}

	const handleSubmit = async (e) => {
		e.preventDefault()

		if (selectedSubjectIds.length === 0) {
			toast.error('Select at least one subject')
			return
		}

		try {
			const result = await selectSubjects({
				subscriptionId,
				subjectIds: selectedSubjectIds,
			}).unwrap()

			const updatedSubs = (profile?.subscriptions ?? []).map((sub) =>
				String(sub._id) === String(subscriptionId)
					? result.subscription
					: sub,
			)

			dispatch(
				setStudentCredentials({
					...studentInfo,
					subscriptions: updatedSubs,
				}),
			)

			await refetchProfile()

			toast.success(
				result.message || 'Your subjects have been saved',
			)
			navigate('/students/mysubjects', { replace: true })
		} catch (err) {
			toast.error(
				err?.data?.message
					|| err?.error
					|| 'Could not save your subject selection',
			)
		}
	}

	if (!studentInfo) {
		return null
	}

	return (
		<div className='chat-app'>
			<div className='main-container'>
				<Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
				<div className='main-content'>
					<Header
						isSidebarOpen={isSidebarOpen}
						toggleSidebar={toggleSidebar}
					/>
					<div className='content-area content-area--subscription'>
						<div className='student-subscription-page'>
							<header className='student-subscription-page__header'>
								<h1 className='student-subscription-page__title heading-gradient'>
									Choose your subjects
								</h1>
								<p className='student-subscription-page__subtitle'>
									Select up to {maxSubjects} subjects from{' '}
									<strong>{programName}</strong>
									{semesterLabel
										? ` for ${semesterLabel}`
										: ''}
									. You can change them when the next
									semester starts.
								</p>
							</header>

							{isLoadingProfile ? (
								<div className='student-subscription-state'>
									<p className='student-subscription-state__text'>
										Loading…
									</p>
								</div>
							) : !subscription ? (
								<div className='student-subscription-state'>
									<p className='student-subscription-state__text'>
										Subscription not found.
									</p>
									<Link
										to='/students/profile'
										className='student-subscription-state__link'
									>
										Go to profile
									</Link>
								</div>
							) : isLoadingSubjects ? (
								<div className='student-subscription-state'>
									<p className='student-subscription-state__text'>
										Loading available subjects…
									</p>
								</div>
							) : isSubjectsError ? (
								<div className='student-subscription-state'>
									<p className='student-subscription-state__text'>
										{subjectsError?.data?.message
											|| subjectsError?.error
											|| 'Could not load subjects.'}
									</p>
									<Link
										to='/students/profile'
										className='student-subscription-state__link'
									>
										Go to profile
									</Link>
								</div>
							) : subjects.length === 0 ? (
								<div className='student-subscription-state'>
									<p className='student-subscription-state__text'>
										No subjects are available for your program
										yet. Contact your school admin.
									</p>
									<Link
										to='/students/profile'
										className='student-subscription-state__link'
									>
										Go to profile
									</Link>
								</div>
							) : (
								<form
									className='login-form student-select-subjects-form'
									onSubmit={handleSubmit}
								>
									<div className='login-field login-field--stack'>
										{subjects.map((subject) => {
											const id = String(subject._id)
											const checked =
												selectedSubjectIds.includes(id)
											const semesterLabel =
												subject.semester != null
													? ` · Semester ${subject.semester}`
													: ''
											return (
												<label
													key={id}
													className='login-remember student-select-subjects-form__item'
												>
													<input
														type='checkbox'
														className='login-checkbox'
														checked={checked}
														disabled={isSaving}
														onChange={() =>
															handleToggleSubject(id)}
													/>
													<span className='login-remember__text'>
														{subject.title}
														{semesterLabel}
													</span>
												</label>
											)
										})}
									</div>

									<p className='school-grades-levels__hint'>
										{selectedSubjectIds.length} of {maxSubjects}{' '}
										subjects selected
									</p>

									<button
										type='submit'
										className='login-submit'
										disabled={
											isSaving
											|| selectedSubjectIds.length === 0
										}
									>
										{isSaving
											? 'Saving…'
											: 'Confirm subjects'}
									</button>

									<p className='login-card__subtitle login-card__subtitle--wide'>
										You cannot change these subjects until
										the next semester starts.
									</p>
								</form>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default StudentSelectPlanSubjectsScreen
