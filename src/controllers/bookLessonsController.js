import asyncHandler from 'express-async-handler'
import crypto from 'node:crypto'
import mongoose from 'mongoose'
import BookLessons from '../models/bookLessonsModel.js'
import Subject from '../models/subjectModel.js'
import {
	getS3,
	getBookBucketName,
	getBookKeyPrefix,
	getPublicBookUrlFromKey,
	getLessonPlaybackUrl,
} from '../config/s3Client.js'
import { extractTextFromPdfBuffer } from '../utils/extractChapterPdfText.js'
import { sanitizeChapterPdfSlug } from '../utils/extractChapterPdf.js'
import { extractBookLessonText } from '../utils/extractBookLessonText.js'
import { parseChapterPdfText } from '../utils/parseChapterPdfText.js'
import {
	extractLessonFromPdfWithVision,
	isVisionEnabled,
} from '../utils/visionExtractChapter.js'
import {
	chapterMainTitle,
	loadSubjectForBookChapters,
	deleteChapterFileFromS3,
} from './subjectController.js'
import {
	buildChapterPineconeIndexName,
	ensurePineconeIndex,
} from '../utils/ragConfig.js'
import { ingestTextToPinecone } from '../utils/ingestion.js'
import { convertSrtToVtt } from '../utils/srtToVtt.js'
import { assignBlockIds } from '../utils/lessonBlockIds.js'
import { annotateVttWithBlockIds } from '../utils/alignTranscriptToLesson.js'
import { generateSuggestedQuestions } from '../utils/generateSuggestedQuestions.js'
import { generateVideoScript } from '../utils/generateVideoScript.js'
import {
	DEFAULT_VOICE,
	generateVideoTts,
	probeMp3DurationSeconds,
} from '../utils/generateVideoTts.js'
import { applyAudioDurationToVideoScript } from '../utils/retimeVideoScriptToAudio.js'
import { buildCreatomateRenderScript } from '../utils/buildCreatomateRenderScript.js'
import {
	assertVideoRenderRecord,
	downloadRenderVideo,
	getRenderStatus,
	startRenderFromSource,
} from '../utils/renderCreatomateVideo.js'
import {
	generateOneSceneIllustration,
} from '../utils/generateSceneIllustrations.js'

// Build the structured lesson from a chapter PDF. Prefers an OpenAI vision
// pass (reads charts, tables and figures directly), and falls back to the
// heuristic text parser when vision is disabled, fails, or is opted out via
// ?mode=text.
async function buildLessonFromChapterPdf (pdfBytes, fallbackTitle, mode) {
	if (mode !== 'text' && isVisionEnabled()) {
		try {
			const lesson = await extractLessonFromPdfWithVision(pdfBytes, {
				fallbackTitle,
			})
			return { lesson, source: 'vision' }
		} catch (visionErr) {
			console.error(
				'Vision lesson extraction failed, falling back to text:',
				visionErr?.message || visionErr,
			)
		}
	}

	const rawText = await extractTextFromPdfBuffer(pdfBytes)
	if (!rawText || rawText.trim().length < 20) {
		const error = new Error(
			'The chapter PDF did not contain enough readable text.',
		)
		error.statusCode = 422
		throw error
	}

	return {
		lesson: parseChapterPdfText(rawText, fallbackTitle),
		source: 'text',
	}
}

function chapterVideoFileIdFromLesson (lesson) {
	return lesson?.chapterVideoFileId
		&& String(lesson.chapterVideoFileId).trim() !== ''
		? String(lesson.chapterVideoFileId).trim()
		: null
}

function chapterVideoFileUrlFromLesson (lesson) {
	const fileId = chapterVideoFileIdFromLesson(lesson)
	if (!fileId) {
		return ''
	}
	return getLessonPlaybackUrl(fileId)
		|| getPublicBookUrlFromKey(fileId)
		|| ''
}

function chapterTranscribeFileIdFromLesson (lesson) {
	return lesson?.chapterTranscribeFileId
		&& String(lesson.chapterTranscribeFileId).trim() !== ''
		? String(lesson.chapterTranscribeFileId).trim()
		: null
}

function chapterTranscribeFileUrlFromLesson (lesson) {
	const fileId = chapterTranscribeFileIdFromLesson(lesson)
	if (!fileId) {
		return ''
	}
	return getPublicBookUrlFromKey(fileId) || ''
}

function videoScriptAudioFileIdFromLesson (lesson) {
	return lesson?.videoScriptAudioFileId
		&& String(lesson.videoScriptAudioFileId).trim() !== ''
		? String(lesson.videoScriptAudioFileId).trim()
		: null
}

function videoScriptAudioFileUrlFromLesson (lesson) {
	const fileId = videoScriptAudioFileIdFromLesson(lesson)
	if (!fileId) {
		return ''
	}
	return getLessonPlaybackUrl(fileId)
		|| getPublicBookUrlFromKey(fileId)
		|| ''
}

function creatomateRenderIdFromLesson (lesson) {
	return lesson?.creatomateRenderId
		&& String(lesson.creatomateRenderId).trim() !== ''
		? String(lesson.creatomateRenderId).trim()
		: null
}

function creatomateRenderStatusFromLesson (lesson) {
	return lesson?.creatomateRenderStatus
		? String(lesson.creatomateRenderStatus).trim().toLowerCase()
		: ''
}

function isCreatomateRenderPending (status) {
	const s = String(status ?? '').trim().toLowerCase()
	if (!s) {
		return false
	}
	return s !== 'succeeded' && s !== 'failed'
}

function creatomateRenderPendingFromLesson (lesson) {
	return Boolean(creatomateRenderIdFromLesson(lesson))
}

function creatomateFieldsForLessonJson (lesson) {
	const creatomateRenderId = creatomateRenderIdFromLesson(lesson)
	const creatomateRenderStatus = creatomateRenderStatusFromLesson(lesson)
		|| undefined
	return {
		creatomateRenderId: creatomateRenderId || undefined,
		creatomateRenderStatus,
		creatomateRenderRequestedAt:
			lesson?.creatomateRenderRequestedAt || undefined,
		hasCreatomateRenderPending: creatomateRenderPendingFromLesson(lesson),
	}
}

function formatSuggestedQuestions (lesson) {
	const items = Array.isArray(lesson?.suggestedQuestions)
		? lesson.suggestedQuestions
		: []

	return items
		.map((item) => ({
			question: item?.question ? String(item.question).trim() : '',
			answer: item?.answer ? String(item.answer).trim() : '',
		}))
		.filter((item) => item.question)
}

function formatVideoScript (lesson) {
	const script = lesson?.videoScript
	if (!script || typeof script !== 'object') {
		return null
	}

	const scenes = Array.isArray(script.scenes) ? script.scenes : []
	const formattedScenes = scenes
		.map((scene, index) => ({
			sceneNumber: scene?.sceneNumber ?? index + 1,
			type: scene?.type ? String(scene.type).trim() : 'concept',
			title: scene?.title ? String(scene.title).trim() : '',
			subtitle: scene?.subtitle ? String(scene.subtitle).trim() : '',
			narration: scene?.narration ? String(scene.narration).trim() : '',
			durationSeconds: Number.isFinite(Number(scene?.durationSeconds))
				? Number(scene.durationSeconds)
				: 0,
			visualNotes: scene?.visualNotes
				? String(scene.visualNotes).trim()
				: '',
			imagePrompt: scene?.imagePrompt
				? String(scene.imagePrompt).trim()
				: '',
			illustrationFileId: scene?.illustrationFileId
				&& String(scene.illustrationFileId).trim() !== ''
				? String(scene.illustrationFileId).trim()
				: '',
			illustrationUrl: (() => {
				const fileId = scene?.illustrationFileId
					&& String(scene.illustrationFileId).trim() !== ''
					? String(scene.illustrationFileId).trim()
					: ''
				if (!fileId) {
					return ''
				}
				return getLessonPlaybackUrl(fileId)
					|| getPublicBookUrlFromKey(fileId)
					|| ''
			})(),
			illustrationGeneratedAt: scene?.illustrationGeneratedAt || undefined,
			term: scene?.term ? String(scene.term).trim() : '',
			definition: scene?.definition
				? String(scene.definition).trim()
				: '',
			items: Array.isArray(scene?.items)
				? scene.items.map((item) => ({
					title: item?.title ? String(item.title).trim() : '',
					body: item?.body ? String(item.body).trim() : '',
					label: item?.label ? String(item.label).trim() : '',
					value: item?.value ? String(item.value).trim() : '',
				}))
				: [],
			data: Array.isArray(scene?.data)
				? scene.data
					.map((item) => ({
						label: item?.label ? String(item.label).trim() : '',
						value: Number(item?.value),
					}))
					.filter((item) => item.label && Number.isFinite(item.value))
				: [],
			regions: Array.isArray(scene?.regions)
				? scene.regions
					.map((region) => String(region ?? '').trim())
					.filter(Boolean)
				: [],
		}))
		.filter((scene) => scene.narration)

	if (formattedScenes.length === 0) {
		return null
	}

	const illustratedCount = formattedScenes.filter(
		(scene) => scene.illustrationFileId,
	).length

	const estimatedDurationSeconds = Number.isFinite(
		Number(script?.estimatedDurationSeconds),
	)
		? Number(script.estimatedDurationSeconds)
		: formattedScenes.reduce(
			(total, scene) => total + scene.durationSeconds,
			0,
		)
	const audioDurationSeconds = Number.isFinite(
		Number(script?.audioDurationSeconds),
	) && Number(script.audioDurationSeconds) > 0
		? Number(script.audioDurationSeconds)
		: undefined

	return {
		title: script?.title ? String(script.title).trim() : '',
		language: script?.language ? String(script.language).trim() : 'es',
		fullNarration: script?.fullNarration
			? String(script.fullNarration).trim()
			: formattedScenes.map((scene) => scene.narration).join(' '),
		estimatedDurationSeconds,
		audioDurationSeconds,
		scenes: formattedScenes,
		generatedAt: script?.generatedAt || undefined,
		audioGeneratedAt: script?.audioGeneratedAt || undefined,
		audioVoice: script?.audioVoice
			? String(script.audioVoice).trim()
			: undefined,
		illustrationsGeneratedAt: script?.illustrationsGeneratedAt || undefined,
		sceneIllustrationCount: illustratedCount,
		hasSceneIllustrations: illustratedCount > 0
			&& illustratedCount === formattedScenes.length,
		videoRenderedAt: script?.videoRenderedAt || undefined,
	}
}

function resolveLessonChatIndexId (subject, lesson) {
	const chapterId = lesson?.bookChapter?.chapterId
	if (!chapterId || !subject) {
		return undefined
	}

	const chapters = Array.isArray(subject.bookChapters)
		? subject.bookChapters
		: []
	const chapter = chapters.find(
		(item) => String(item._id) === String(chapterId),
	)
	const storedIndex = chapter?.pineconeIndexName
		&& String(chapter.pineconeIndexName).trim() !== ''
		? String(chapter.pineconeIndexName).trim()
		: null

	if (storedIndex) {
		return storedIndex
	}

	return buildChapterPineconeIndexName(subject._id, chapterId)
}

function bookLessonIndexToJson (lesson) {
	const content = Array.isArray(lesson.content) ? lesson.content : []
	const chapterVideoFileId = chapterVideoFileIdFromLesson(lesson)
	const chapterTranscribeFileId = chapterTranscribeFileIdFromLesson(lesson)
	const videoScript = formatVideoScript(lesson)

	return {
		_id: lesson._id,
		mainTitle: lesson.mainTitle,
		unitTheme: lesson.unitTheme || '',
		heroSubtitle: lesson.heroSubtitle || '',
		bookChapter: lesson.bookChapter,
		hasContent: content.length > 0,
		chapterVideoFileId: chapterVideoFileId || undefined,
		chapterVideoFileUrl: chapterVideoFileUrlFromLesson(lesson) || undefined,
		chapterTranscribeFileId: chapterTranscribeFileId || undefined,
		chapterTranscribeFileUrl:
			chapterTranscribeFileUrlFromLesson(lesson) || undefined,
		suggestedQuestions: formatSuggestedQuestions(lesson),
		hasSuggestedQuestions: formatSuggestedQuestions(lesson).length > 0,
		videoScript: videoScript || undefined,
		hasVideoScript: Boolean(videoScript),
		videoScriptAudioFileId:
			videoScriptAudioFileIdFromLesson(lesson) || undefined,
		videoScriptAudioFileUrl:
			videoScriptAudioFileUrlFromLesson(lesson) || undefined,
		hasVideoScriptAudio: Boolean(videoScriptAudioFileIdFromLesson(lesson)),
		hasSceneIllustrations: Boolean(videoScript?.hasSceneIllustrations),
		sceneIllustrationCount: videoScript?.sceneIllustrationCount || 0,
		...creatomateFieldsForLessonJson(lesson),
	}
}

async function realignLessonTranscriptIfPresent (lesson, s3, bucket) {
	const fileKey = chapterTranscribeFileIdFromLesson(lesson)
	if (!fileKey || !s3 || !bucket) {
		return
	}

	const alignmentLesson = {
		content: assignBlockIds(
			Array.isArray(lesson.content) ? lesson.content : [],
		),
		mainTitle: lesson.mainTitle || '',
		unitTheme: lesson.unitTheme || '',
		heroSubtitle: lesson.heroSubtitle || '',
		objectivesText: lesson.objectivesText || '',
	}

	try {
		const object = await s3.getObject({
			Bucket: bucket,
			Key: fileKey,
		}).promise()

		const rawVtt = object.Body?.toString('utf8') || ''
		if (!rawVtt.trim()) {
			return
		}

		const annotatedVtt = annotateVttWithBlockIds(rawVtt, alignmentLesson)
		await s3.upload({
			Bucket: bucket,
			Key: fileKey,
			Body: Buffer.from(annotatedVtt, 'utf8'),
			ContentType: 'text/vtt; charset=utf-8',
		}).promise()
	} catch (realignErr) {
		console.warn(
			'Could not re-align transcript anchors after lesson update:',
			realignErr?.message || realignErr,
		)
	}
}

function bookLessonToJson (lesson, subjectMeta = {}, chatIndexId) {
	const content = Array.isArray(lesson.content)
		? assignBlockIds(lesson.content).map((block) => {
			if (block.type) {
				return {
					blockId: block.blockId || '',
					type: block.type,
					text: block.text || '',
					items: Array.isArray(block.items)
						? block.items.map((item) => ({
							label: item.label || '',
							title: item.title || '',
							body: item.body || '',
							text: item.text || '',
							value: item.value || '',
							cells: Array.isArray(item.cells)
								? item.cells.map((cell) => cell || '')
								: [],
						}))
						: [],
					meta: block.meta || {},
				}
			}
			return {
				blockId: block.blockId || '',
				type: block.subtitle ? 'h3' : 'p',
				text: block.subtitle || block.text || '',
				items: block.text && block.subtitle
					? [{ text: block.text }]
					: [],
				meta: {},
			}
		})
		: []

	const chapterVideoFileId = chapterVideoFileIdFromLesson(lesson)
	const chapterTranscribeFileId = chapterTranscribeFileIdFromLesson(lesson)
	const videoScript = formatVideoScript(lesson)

	return {
		_id: lesson._id,
		mainTitle: lesson.mainTitle,
		unitTheme: lesson.unitTheme || '',
		heroSubtitle: lesson.heroSubtitle || '',
		objectivesText: lesson.objectivesText || '',
		content,
		dateCreated: lesson.dateCreated,
		subject: subjectMeta,
		bookChapter: lesson.bookChapter,
		hasContent: content.length > 0,
		chapterVideoFileId: chapterVideoFileId || undefined,
		chapterVideoFileUrl: chapterVideoFileUrlFromLesson(lesson) || undefined,
		chapterTranscribeFileId: chapterTranscribeFileId || undefined,
		chapterTranscribeFileUrl:
			chapterTranscribeFileUrlFromLesson(lesson) || undefined,
		suggestedQuestions: formatSuggestedQuestions(lesson),
		hasSuggestedQuestions: formatSuggestedQuestions(lesson).length > 0,
		videoScript: videoScript || undefined,
		hasVideoScript: Boolean(videoScript),
		videoScriptAudioFileId:
			videoScriptAudioFileIdFromLesson(lesson) || undefined,
		videoScriptAudioFileUrl:
			videoScriptAudioFileUrlFromLesson(lesson) || undefined,
		hasVideoScriptAudio: Boolean(videoScriptAudioFileIdFromLesson(lesson)),
		hasSceneIllustrations: Boolean(videoScript?.hasSceneIllustrations),
		sceneIllustrationCount: videoScript?.sceneIllustrationCount || 0,
		...creatomateFieldsForLessonJson(lesson),
		chatIndexId: chatIndexId || undefined,
	}
}

function videoExtFromMime (mime, originalName) {
	const m = String(mime || '').toLowerCase()
	const n = String(originalName || '').toLowerCase()
	if (m.includes('mp4') || n.endsWith('.mp4')) {
		return '.mp4'
	}
	if (m.includes('quicktime') || n.endsWith('.mov')) {
		return '.mov'
	}
	return '.webm'
}

async function loadChapterPdfBytes (res, fileKey) {
	const s3 = getS3()
	const bucket = getBookBucketName()

	if (!s3 || !bucket) {
		res.status(503)
		throw new Error(
			'File storage is not configured. Set AWS credentials and '
			+ 'AWS_S3_BUCKET.',
		)
	}

	try {
		const object = await s3.getObject({
			Bucket: bucket,
			Key: String(fileKey).trim(),
		}).promise()
		return object.Body
	} catch (loadErr) {
		console.error(loadErr)
		res.status(502)
		throw new Error('Could not load the chapter PDF from storage.')
	}
}

async function assertStudentCanAccessLesson (res, studentId, lesson) {
	const subject = await Subject.findById(lesson.subject).select(
		'students title bookChapters',
	)

	if (!subject) {
		res.status(404)
		throw new Error('Subject not found')
	}

	const isEnrolled = (subject.students || []).some(
		(id) => String(id) === String(studentId),
	)

	if (!isEnrolled) {
		res.status(403)
		throw new Error('Not authorized to view this lesson')
	}

	return subject
}

// GET /api/book-lessons/subject/:subjectId — protectStudent
const getBookLessonsBySubjectForStudent = asyncHandler(async (req, res) => {
	const { subjectId } = req.params

	if (!mongoose.Types.ObjectId.isValid(subjectId)) {
		res.status(400)
		throw new Error('Invalid subject id')
	}

	const subject = await Subject.findById(subjectId).select(
		'students title bookChapters',
	)

	if (!subject) {
		res.status(404)
		throw new Error('Subject not found')
	}

	const isEnrolled = (subject.students || []).some(
		(id) => String(id) === String(req.student._id),
	)

	if (!isEnrolled) {
		res.status(403)
		throw new Error('Not authorized to view this book')
	}

	const lessons = await BookLessons.find({ subject: subjectId })
		.sort({
			'bookChapter.chapterNumber': 1,
			createdAt: 1,
		})
		.lean()

	res.status(200).json(
		lessons.map((lesson) => ({
			...bookLessonIndexToJson(lesson),
			chatIndexId: resolveLessonChatIndexId(subject, lesson),
		})),
	)
})

// GET /api/book-lessons/:lessonId — protectStudent
const getBookLessonById = asyncHandler(async (req, res) => {
	const { lessonId } = req.params

	if (!mongoose.Types.ObjectId.isValid(lessonId)) {
		res.status(400)
		throw new Error('Invalid lesson id')
	}

	const lesson = await BookLessons.findById(lessonId)

	if (!lesson) {
		res.status(404)
		throw new Error('Lesson not found')
	}

	const subject = await assertStudentCanAccessLesson(
		res,
		req.student._id,
		lesson,
	)

	res.status(200).json(bookLessonToJson(lesson, {
		_id: subject._id,
		title: subject.title,
	}, resolveLessonChatIndexId(subject, lesson)))
})

// GET /api/subjects/:id/book-lessons — protectSchoolAdmin
// GET /api/subjects/:id/teacher/book-lessons — protectTeacher
const getBookLessonsBySubject = asyncHandler(async (req, res) => {
	const { id } = req.params
	await loadSubjectForBookChapters(req, res, id)

	const lessons = await BookLessons.find({ subject: id })
		.sort({
			'bookChapter.chapterNumber': 1,
			createdAt: 1,
		})
		.lean()

	res.status(200).json(
		lessons.map((lesson) => bookLessonToJson(lesson)),
	)
})

// POST /api/subjects/:id/book-chapters/:chapterId/generate-lessons
// POST /api/subjects/:id/teacher/book-chapters/:chapterId/generate-lessons
const generateBookLessonsFromChapter = asyncHandler(async (req, res) => {
	const { id, chapterId } = req.params
	const { subject } = await loadSubjectForBookChapters(req, res, id)

	if (!mongoose.Types.ObjectId.isValid(chapterId)) {
		res.status(400)
		throw new Error('Invalid chapter id')
	}

	const chapterIndex = (subject.bookChapters || []).findIndex(
		(item) => String(item._id) === String(chapterId),
	)

	if (chapterIndex < 0) {
		res.status(404)
		throw new Error('Chapter not found')
	}

	const chapter = subject.bookChapters[chapterIndex]
	const fileKey = chapter.ChapterFileId
		&& String(chapter.ChapterFileId).trim() !== ''
		? String(chapter.ChapterFileId).trim()
		: null

	if (!fileKey) {
		res.status(400)
		throw new Error(
			'This chapter has no PDF yet. Generate the chapter PDF first.',
		)
	}

	const pdfBytes = await loadChapterPdfBytes(res, fileKey)
	const fallbackTitle = chapterMainTitle(chapter, chapterIndex)

	let parsed
	try {
		const result = await buildLessonFromChapterPdf(
			pdfBytes,
			fallbackTitle,
			req.query?.mode,
		)
		parsed = result.lesson
	} catch (extractErr) {
		console.error(extractErr)
		res.status(extractErr.statusCode || 422)
		throw new Error(
			extractErr.statusCode === 422
				? extractErr.message
				: 'Could not read content from the chapter PDF.',
		)
	}

	const chapterNumber = chapter.ChapterNumber ?? chapterIndex + 1
	const chapterTitle = chapter.ChapterTitle != null
		? String(chapter.ChapterTitle).trim()
		: ''

	const lessonContent = assignBlockIds(parsed.content || [])

	const lesson = await BookLessons.findOneAndUpdate(
		{
			subject: subject._id,
			'bookChapter.chapterId': chapter._id,
		},
		{
			$set: {
				mainTitle: parsed.mainTitle,
				unitTheme: parsed.unitTheme || '',
				heroSubtitle: parsed.heroSubtitle || '',
				objectivesText: parsed.objectivesText || '',
				content: lessonContent,
				subject: subject._id,
				bookChapter: {
					chapterId: chapter._id,
					chapterNumber,
					chapterTitle,
				},
				dateCreated: new Date(),
			},
		},
		{
			new: true,
			upsert: true,
			setDefaultsOnInsert: true,
		},
	)

	const s3 = getS3()
	const bucket = getBookBucketName()
	await realignLessonTranscriptIfPresent(lesson, s3, bucket)

	res.status(200).json(bookLessonToJson(lesson))
})

// GET /api/subjects/:id/book-lessons/:lessonId — protectSchoolAdmin
// GET /api/subjects/:id/teacher/book-lessons/:lessonId — protectTeacher
const getBookLessonByIdForSchoolAdmin = asyncHandler(async (req, res) => {
	const { id, lessonId } = req.params
	await loadSubjectForBookChapters(req, res, id)

	if (!mongoose.Types.ObjectId.isValid(lessonId)) {
		res.status(400)
		throw new Error('Invalid lesson id')
	}

	const lesson = await BookLessons.findOne({
		_id: lessonId,
		subject: id,
	})

	if (!lesson) {
		res.status(404)
		throw new Error('Lesson not found')
	}

	const subject = await Subject.findById(id).select('title bookChapters')

	res.status(200).json(bookLessonToJson(lesson, {
		_id: subject?._id,
		title: subject?.title,
	}, resolveLessonChatIndexId(subject, lesson)))
})

// POST /api/subjects/:id/book-chapters/:chapterId/generate-tutor-txt
const generateChapterTutorTxtFromLesson = asyncHandler(async (req, res) => {
	const { id, chapterId } = req.params
	const { subject } = await loadSubjectForBookChapters(req, res, id)

	if (!mongoose.Types.ObjectId.isValid(chapterId)) {
		res.status(400)
		throw new Error('Invalid chapter id')
	}

	const chapterIndex = (subject.bookChapters || []).findIndex(
		(item) => String(item._id) === String(chapterId),
	)

	if (chapterIndex < 0) {
		res.status(404)
		throw new Error('Chapter not found')
	}

	const chapter = subject.bookChapters[chapterIndex]
	const lesson = await BookLessons.findOne({
		subject: subject._id,
		'bookChapter.chapterId': chapter._id,
	})

	if (!lesson) {
		res.status(400)
		throw new Error(
			'This chapter has no web lesson yet. Generate the web lesson first.',
		)
	}

	const content = Array.isArray(lesson.content) ? lesson.content : []
	if (content.length === 0) {
		res.status(422)
		throw new Error('The web lesson has no content to extract.')
	}

	const plainText = extractBookLessonText(lesson)
	if (!plainText || plainText.trim().length < 20) {
		res.status(422)
		throw new Error(
			'The web lesson did not contain enough readable text.',
		)
	}

	const pineconeIndexName = buildChapterPineconeIndexName(
		subject._id,
		chapter._id,
	)

	try {
		await ensurePineconeIndex(pineconeIndexName)
	} catch (pineconeErr) {
		console.error(pineconeErr)
		res.status(502)
		throw new Error('Failed to create Pinecone index for this chapter.')
	}

	chapter.pineconeIndexName = pineconeIndexName

	const s3 = getS3()
	const bucket = getBookBucketName()
	if (!s3 || !bucket) {
		res.status(503)
		throw new Error(
			'File storage is not configured. Set AWS credentials and '
			+ 'AWS_S3_BUCKET.',
		)
	}

	const previousFileKey = chapter.ChapterTxtFileId
		&& String(chapter.ChapterTxtFileId).trim() !== ''
		? String(chapter.ChapterTxtFileId).trim()
		: null

	const prefix = getBookKeyPrefix()
	const random = crypto.randomBytes(8).toString('hex')
	const slug = sanitizeChapterPdfSlug(
		chapter.ChapterTitle,
		chapter.ChapterNumber ?? chapterIndex + 1,
	)
	const key = `${prefix}/${id}/chapters/${chapterId}-tutor-${slug}-${random}.txt`

	try {
		const upload = await s3.upload({
			Bucket: bucket,
			Key: key,
			Body: Buffer.from(plainText, 'utf8'),
			ContentType: 'text/plain; charset=utf-8',
		}).promise()

		chapter.ChapterTxtFileId = upload.Key

		if (previousFileKey && previousFileKey !== upload.Key) {
			await deleteChapterFileFromS3(previousFileKey)
		}
	} catch (uploadErr) {
		console.error(uploadErr)
		res.status(502)
		throw new Error('Failed to upload the lesson text file to storage.')
	}

	try {
		await ingestTextToPinecone({
			text: plainText,
			indexName: pineconeIndexName,
			metadata: {
				subjectId: String(subject._id),
				chapterId: String(chapter._id),
				chapterTitle: chapter.ChapterTitle
					? String(chapter.ChapterTitle).trim()
					: '',
				source: pineconeIndexName,
			},
		})
	} catch (ingestErr) {
		console.error(ingestErr)
		res.status(502)
		throw new Error('Failed to ingest lesson text into Pinecone.')
	}

	await subject.save()

	const txtFileId = String(chapter.ChapterTxtFileId).trim()
	const chapterTxtFileUrl = getPublicBookUrlFromKey(txtFileId) || undefined

	res.status(200).json({
		chapterId: String(chapter._id),
		ChapterTxtFileId: txtFileId,
		chapterTxtFileUrl,
		pineconeIndexName,
	})
})

// POST /api/subjects/:id/book-chapters/:chapterId/generate-suggested-questions
const generateSuggestedQuestionsFromLesson = asyncHandler(async (req, res) => {
	const { id, chapterId } = req.params
	const { subject } = await loadSubjectForBookChapters(req, res, id)

	if (!mongoose.Types.ObjectId.isValid(chapterId)) {
		res.status(400)
		throw new Error('Invalid chapter id')
	}

	const chapterIndex = (subject.bookChapters || []).findIndex(
		(item) => String(item._id) === String(chapterId),
	)

	if (chapterIndex < 0) {
		res.status(404)
		throw new Error('Chapter not found')
	}

	const chapter = subject.bookChapters[chapterIndex]
	const lesson = await BookLessons.findOne({
		subject: subject._id,
		'bookChapter.chapterId': chapter._id,
	})

	if (!lesson) {
		res.status(400)
		throw new Error(
			'This chapter has no web lesson yet. Generate the web lesson first.',
		)
	}

	const content = Array.isArray(lesson.content) ? lesson.content : []
	if (content.length === 0) {
		res.status(422)
		throw new Error('The web lesson has no content to extract.')
	}

	let suggestedQuestions
	try {
		suggestedQuestions = await generateSuggestedQuestions(lesson)
	} catch (genErr) {
		console.error(genErr)
		res.status(genErr.statusCode || 502)
		throw new Error(
			genErr.message || 'Could not generate suggested questions.',
		)
	}

	if (!Array.isArray(suggestedQuestions) || suggestedQuestions.length === 0) {
		res.status(422)
		throw new Error('No suggested questions were generated.')
	}

	lesson.suggestedQuestions = suggestedQuestions
	await lesson.save()

	res.status(200).json({
		chapterId: String(chapter._id),
		lessonId: String(lesson._id),
		suggestedQuestions: formatSuggestedQuestions(lesson),
		hasSuggestedQuestions: true,
	})
})

// POST /api/subjects/:id/book-chapters/:chapterId/generate-video-script
const generateVideoScriptFromLesson = asyncHandler(async (req, res) => {
	const { id, chapterId } = req.params
	const { subject } = await loadSubjectForBookChapters(req, res, id)

	if (!mongoose.Types.ObjectId.isValid(chapterId)) {
		res.status(400)
		throw new Error('Invalid chapter id')
	}

	const chapterIndex = (subject.bookChapters || []).findIndex(
		(item) => String(item._id) === String(chapterId),
	)

	if (chapterIndex < 0) {
		res.status(404)
		throw new Error('Chapter not found')
	}

	const chapter = subject.bookChapters[chapterIndex]
	const lesson = await BookLessons.findOne({
		subject: subject._id,
		'bookChapter.chapterId': chapter._id,
	})

	if (!lesson) {
		res.status(400)
		throw new Error(
			'This chapter has no web lesson yet. Generate the web lesson first.',
		)
	}

	const content = Array.isArray(lesson.content) ? lesson.content : []
	if (content.length === 0) {
		res.status(422)
		throw new Error('The web lesson has no content to extract.')
	}

	let videoScript
	try {
		videoScript = await generateVideoScript(lesson)
	} catch (genErr) {
		console.error(genErr)
		res.status(genErr.statusCode || 502)
		throw new Error(
			genErr.message || 'Could not generate video script.',
		)
	}

	const formattedVideoScript = formatVideoScript({
		videoScript,
	})
	if (!formattedVideoScript) {
		res.status(422)
		throw new Error('No video script scenes were generated.')
	}

	lesson.videoScript = videoScript
	await lesson.save()

	res.status(200).json({
		chapterId: String(chapter._id),
		lessonId: String(lesson._id),
		videoScript: formatVideoScript(lesson),
		hasVideoScript: true,
	})
})

// POST /api/subjects/:id/book-chapters/:chapterId/generate-video-audio
const generateVideoScriptAudioFromLesson = asyncHandler(async (req, res) => {
	const { id, chapterId } = req.params
	const { subject } = await loadSubjectForBookChapters(req, res, id)

	if (!mongoose.Types.ObjectId.isValid(chapterId)) {
		res.status(400)
		throw new Error('Invalid chapter id')
	}

	const chapterIndex = (subject.bookChapters || []).findIndex(
		(item) => String(item._id) === String(chapterId),
	)

	if (chapterIndex < 0) {
		res.status(404)
		throw new Error('Chapter not found')
	}

	const chapter = subject.bookChapters[chapterIndex]
	const lesson = await BookLessons.findOne({
		subject: subject._id,
		'bookChapter.chapterId': chapter._id,
	})

	if (!lesson) {
		res.status(400)
		throw new Error(
			'This chapter has no web lesson yet. Generate the web lesson first.',
		)
	}

	const videoScript = formatVideoScript(lesson)
	if (!videoScript?.fullNarration) {
		res.status(422)
		throw new Error(
			'This chapter has no video script narration yet. '
			+ 'Generate the video script first.',
		)
	}

	const s3 = getS3()
	const bucket = getBookBucketName()
	if (!s3 || !bucket) {
		res.status(503)
		throw new Error(
			'File storage is not configured. Set AWS credentials and '
			+ 'AWS_S3_BUCKET.',
		)
	}

	let audioBuffer
	try {
		audioBuffer = await generateVideoTts(videoScript.fullNarration)
	} catch (genErr) {
		console.error(genErr)
		res.status(genErr.statusCode || 502)
		throw new Error(
			genErr.message || 'Could not generate video narration audio.',
		)
	}

	if (!audioBuffer?.length) {
		res.status(422)
		throw new Error('No audio was generated from the video script.')
	}

	let audioDurationSeconds
	try {
		audioDurationSeconds = await probeMp3DurationSeconds(audioBuffer)
	} catch (probeErr) {
		console.error(probeErr)
		res.status(502)
		throw new Error(
			probeErr.message || 'Could not measure narration audio duration.',
		)
	}

	const previousFileKey = videoScriptAudioFileIdFromLesson(lesson)
	const prefix = getBookKeyPrefix()
	const random = crypto.randomBytes(8).toString('hex')
	const slug = sanitizeChapterPdfSlug(
		chapter.ChapterTitle,
		chapter.ChapterNumber ?? chapterIndex + 1,
	)
	const key = `${prefix}/${id}/chapters/${chapterId}-video-audio-${slug}-${random}.mp3`

	try {
		const upload = await s3.upload({
			Bucket: bucket,
			Key: key,
			Body: audioBuffer,
			ContentType: 'audio/mpeg',
		}).promise()

		lesson.videoScriptAudioFileId = upload.Key
		if (lesson.videoScript && typeof lesson.videoScript === 'object') {
			applyAudioDurationToVideoScript(
				lesson.videoScript,
				audioDurationSeconds,
			)
			lesson.videoScript.audioGeneratedAt = new Date()
			lesson.videoScript.audioVoice = DEFAULT_VOICE
			lesson.markModified('videoScript')
		}
		await lesson.save()

		if (previousFileKey && previousFileKey !== upload.Key) {
			await deleteChapterFileFromS3(previousFileKey)
		}

		const videoScriptAudioFileId = String(upload.Key).trim()
		const videoScriptAudioFileUrl = getLessonPlaybackUrl(
			videoScriptAudioFileId,
		)
			|| getPublicBookUrlFromKey(videoScriptAudioFileId)
			|| undefined

		res.status(200).json({
			chapterId: String(chapter._id),
			lessonId: String(lesson._id),
			videoScriptAudioFileId,
			videoScriptAudioFileUrl,
			hasVideoScriptAudio: true,
			videoScript: formatVideoScript(lesson),
		})
	} catch (uploadErr) {
		console.error(uploadErr)
		res.status(502)
		throw new Error('Failed to upload the video narration audio to storage.')
	}
})

// POST /api/subjects/:id/book-chapters/:chapterId/generate-scene-illustrations
const generateSceneIllustrationsFromLesson = asyncHandler(async (req, res) => {
	const { id, chapterId } = req.params
	const force = Boolean(req.body?.force)
	const { subject } = await loadSubjectForBookChapters(req, res, id)

	if (!mongoose.Types.ObjectId.isValid(chapterId)) {
		res.status(400)
		throw new Error('Invalid chapter id')
	}

	const chapterIndex = (subject.bookChapters || []).findIndex(
		(item) => String(item._id) === String(chapterId),
	)

	if (chapterIndex < 0) {
		res.status(404)
		throw new Error('Chapter not found')
	}

	const chapter = subject.bookChapters[chapterIndex]
	const lesson = await BookLessons.findOne({
		subject: subject._id,
		'bookChapter.chapterId': chapter._id,
	})

	if (!lesson) {
		res.status(400)
		throw new Error(
			'This chapter has no web lesson yet. Generate the web lesson first.',
		)
	}

	if (!lesson.videoScript || typeof lesson.videoScript !== 'object') {
		res.status(422)
		throw new Error(
			'This chapter has no video script yet. Generate the video script first.',
		)
	}

	const rawScenes = Array.isArray(lesson.videoScript.scenes)
		? lesson.videoScript.scenes
		: []
	if (rawScenes.length === 0) {
		res.status(422)
		throw new Error('Video script has no scenes to illustrate.')
	}

	const s3 = getS3()
	const bucket = getBookBucketName()
	if (!s3 || !bucket) {
		res.status(503)
		throw new Error(
			'File storage is not configured. Set AWS credentials and '
			+ 'AWS_S3_BUCKET.',
		)
	}

	const scenesForGeneration = rawScenes.map((scene, index) => ({
		sceneNumber: scene?.sceneNumber ?? index + 1,
		type: scene?.type,
		title: scene?.title,
		subtitle: scene?.subtitle,
		narration: scene?.narration,
		visualNotes: scene?.visualNotes,
		regions: scene?.regions,
		data: scene?.data,
		illustrationFileId: scene?.illustrationFileId,
	}))

	const prefix = getBookKeyPrefix()
	const slug = sanitizeChapterPdfSlug(
		chapter.ChapterTitle,
		chapter.ChapterNumber ?? chapterIndex + 1,
	)
	const generatedAt = new Date()
	let generatedCount = 0
	let skippedCount = 0
	const previousKeysToDelete = []

	try {
		for (let i = 0; i < scenesForGeneration.length; i++) {
			const sceneInput = scenesForGeneration[i]
			const scene = rawScenes[i]
			const existingId = scene?.illustrationFileId
				&& String(scene.illustrationFileId).trim() !== ''
				? String(scene.illustrationFileId).trim()
				: ''

			if (existingId && !force) {
				skippedCount += 1
				continue
			}

			const item = await generateOneSceneIllustration(sceneInput)
			const random = crypto.randomBytes(6).toString('hex')
			const sceneNum = sceneInput.sceneNumber || i + 1
			const key = `${prefix}/${id}/chapters/`
				+ `${chapterId}-scene-${sceneNum}-illust-${slug}-${random}.png`

			const upload = await s3.upload({
				Bucket: bucket,
				Key: key,
				Body: item.buffer,
				ContentType: item.contentType || 'image/png',
			}).promise()

			if (existingId && existingId !== upload.Key) {
				previousKeysToDelete.push(existingId)
			}

			scene.imagePrompt = item.imagePrompt
			scene.illustrationFileId = upload.Key
			scene.illustrationGeneratedAt = generatedAt
			generatedCount += 1

			lesson.videoScript.scenes = rawScenes
			lesson.videoScript.illustrationsGeneratedAt = generatedAt
			lesson.markModified('videoScript')
			await lesson.save()
		}

		for (const oldKey of previousKeysToDelete) {
			await deleteChapterFileFromS3(oldKey)
		}

		const videoScript = formatVideoScript(lesson)
		res.status(200).json({
			chapterId: String(chapter._id),
			lessonId: String(lesson._id),
			generatedCount,
			skippedCount,
			force,
			hasSceneIllustrations: Boolean(videoScript?.hasSceneIllustrations),
			sceneIllustrationCount: videoScript?.sceneIllustrationCount || 0,
			videoScript,
		})
	} catch (genErr) {
		console.error(genErr)
		const videoScript = formatVideoScript(lesson)
		const partialMessage = generatedCount > 0
			? ` Generated ${generatedCount} illustration(s) before failing.`
			: ''
		res.status(genErr.statusCode || 502)
		throw new Error(
			(genErr.message || 'Could not generate scene illustrations.')
			+ partialMessage
			+ (videoScript?.sceneIllustrationCount
				? ` ${videoScript.sceneIllustrationCount} scene(s) already saved.`
				: ''),
		)
	}
})

// POST /api/subjects/:id/book-chapters/:chapterId/generate-animated-video
const generateAnimatedVideoFromLesson = asyncHandler(async (req, res) => {
	const { id, chapterId } = req.params
	const { subject } = await loadSubjectForBookChapters(req, res, id)

	if (!mongoose.Types.ObjectId.isValid(chapterId)) {
		res.status(400)
		throw new Error('Invalid chapter id')
	}

	const chapterIndex = (subject.bookChapters || []).findIndex(
		(item) => String(item._id) === String(chapterId),
	)

	if (chapterIndex < 0) {
		res.status(404)
		throw new Error('Chapter not found')
	}

	const chapter = subject.bookChapters[chapterIndex]
	const lesson = await BookLessons.findOne({
		subject: subject._id,
		'bookChapter.chapterId': chapter._id,
	})

	if (!lesson) {
		res.status(400)
		throw new Error(
			'This chapter has no web lesson yet. Generate the web lesson first.',
		)
	}

	const videoScript = formatVideoScript(lesson)
	if (!videoScript?.scenes?.length) {
		res.status(422)
		throw new Error(
			'This chapter has no video script yet. Generate the video script first.',
		)
	}

	const audioFileId = videoScriptAudioFileIdFromLesson(lesson)
	if (!audioFileId) {
		res.status(422)
		throw new Error(
			'This chapter has no narration audio yet. '
			+ 'Generate the video narration audio first.',
		)
	}

	const audioUrl = videoScriptAudioFileUrlFromLesson(lesson)
	if (!audioUrl) {
		res.status(503)
		throw new Error(
			'Could not build a playback URL for the narration audio.',
		)
	}

	let renderScript
	try {
		renderScript = buildCreatomateRenderScript(videoScript, audioUrl)
	} catch (buildErr) {
		res.status(422)
		throw new Error(buildErr.message || 'Could not build video render script.')
	}

	let startedRender
	try {
		startedRender = await startRenderFromSource(renderScript)
	} catch (renderErr) {
		console.error(renderErr)
		res.status(renderErr.statusCode || 502)
		throw new Error(
			renderErr.message || 'Creatomate could not start the video render.',
		)
	}

	const creatomateRenderId = String(startedRender.id).trim()
	const creatomateRenderStatus = String(
		startedRender.status ?? 'planned',
	).trim().toLowerCase()

	lesson.creatomateRenderId = creatomateRenderId
	lesson.creatomateRenderStatus = creatomateRenderStatus
	lesson.creatomateRenderRequestedAt = new Date()
	await lesson.save()

	res.status(202).json({
		chapterId: String(chapter._id),
		lessonId: String(lesson._id),
		creatomateRenderId,
		creatomateRenderStatus,
		hasCreatomateRenderPending: isCreatomateRenderPending(
			creatomateRenderStatus,
		),
		message:
			'Creatomate render started. Use Check video status when processing '
			+ 'may be complete.',
	})
})

// POST /api/subjects/:id/book-chapters/:chapterId/check-animated-video-status
const checkAnimatedVideoStatusFromLesson = asyncHandler(async (req, res) => {
	const { id, chapterId } = req.params
	const { subject } = await loadSubjectForBookChapters(req, res, id)

	if (!mongoose.Types.ObjectId.isValid(chapterId)) {
		res.status(400)
		throw new Error('Invalid chapter id')
	}

	const chapterIndex = (subject.bookChapters || []).findIndex(
		(item) => String(item._id) === String(chapterId),
	)

	if (chapterIndex < 0) {
		res.status(404)
		throw new Error('Chapter not found')
	}

	const chapter = subject.bookChapters[chapterIndex]
	const lesson = await BookLessons.findOne({
		subject: subject._id,
		'bookChapter.chapterId': chapter._id,
	})

	if (!lesson) {
		res.status(400)
		throw new Error(
			'This chapter has no web lesson yet. Generate the web lesson first.',
		)
	}

	const creatomateRenderId = creatomateRenderIdFromLesson(lesson)
	if (!creatomateRenderId) {
		res.status(422)
		throw new Error(
			'No Creatomate render is in progress for this chapter. '
			+ 'Generate a Creatomate video first.',
		)
	}

	let renderRecord
	try {
		renderRecord = await getRenderStatus(creatomateRenderId)
	} catch (statusErr) {
		console.error(statusErr)
		res.status(statusErr.statusCode || 502)
		throw new Error(
			statusErr.message || 'Could not check Creatomate render status.',
		)
	}

	const creatomateRenderStatus = String(
		renderRecord?.status ?? '',
	).trim().toLowerCase()

	lesson.creatomateRenderStatus = creatomateRenderStatus || undefined
	await lesson.save()

	if (isCreatomateRenderPending(creatomateRenderStatus)) {
		res.status(200).json({
			chapterId: String(chapter._id),
			lessonId: String(lesson._id),
			creatomateRenderId,
			creatomateRenderStatus,
			pending: true,
			addedToLesson: false,
			hasCreatomateRenderPending: true,
			message:
				'Video is still processing on Creatomate ('
				+ `${creatomateRenderStatus || 'in progress'}). `
				+ 'Check again in a few minutes.',
		})
		return
	}

	if (creatomateRenderStatus === 'failed') {
		const failMessage = renderRecord?.error_message
			|| renderRecord?.message
			|| 'Creatomate render failed'
		res.status(422)
		throw new Error(failMessage)
	}

	if (creatomateRenderStatus !== 'succeeded') {
		res.status(200).json({
			chapterId: String(chapter._id),
			lessonId: String(lesson._id),
			creatomateRenderId,
			creatomateRenderStatus,
			pending: true,
			addedToLesson: false,
			hasCreatomateRenderPending: true,
			message:
				'Creatomate has not finished this render yet. Please check again '
				+ 'shortly.',
		})
		return
	}

	try {
		assertVideoRenderRecord(renderRecord, 'Creatomate finished render')
	} catch (assertErr) {
		lesson.creatomateRenderId = undefined
		lesson.creatomateRenderStatus = 'failed'
		await lesson.save()
		res.status(assertErr.statusCode || 422)
		throw assertErr
	}

	const s3 = getS3()
	const bucket = getBookBucketName()
	if (!s3 || !bucket) {
		res.status(503)
		throw new Error(
			'File storage is not configured. Set AWS credentials and '
			+ 'AWS_S3_BUCKET.',
		)
	}

	let videoBuffer
	try {
		videoBuffer = await downloadRenderVideo(renderRecord.url)
	} catch (downloadErr) {
		console.error(downloadErr)
		res.status(502)
		throw new Error(
			downloadErr.message || 'Could not download the video from Creatomate.',
		)
	}

	if (!videoBuffer?.length) {
		res.status(422)
		throw new Error('Creatomate returned an empty video file.')
	}

	const previousFileKey = chapterVideoFileIdFromLesson(lesson)
	const prefix = getBookKeyPrefix()
	const random = crypto.randomBytes(8).toString('hex')
	const slug = sanitizeChapterPdfSlug(
		chapter.ChapterTitle,
		chapter.ChapterNumber ?? chapterIndex + 1,
	)
	const key = `${prefix}/${id}/chapters/${chapterId}-tutor-video-${slug}-${random}.mp4`

	try {
		const upload = await s3.upload({
			Bucket: bucket,
			Key: key,
			Body: videoBuffer,
			ContentType: 'video/mp4',
		}).promise()

		lesson.chapterVideoFileId = upload.Key
		if (lesson.videoScript && typeof lesson.videoScript === 'object') {
			lesson.videoScript.videoRenderedAt = new Date()
			lesson.markModified('videoScript')
		}
		lesson.creatomateRenderId = undefined
		lesson.creatomateRenderStatus = undefined
		lesson.creatomateRenderRequestedAt = undefined
		await lesson.save()

		if (previousFileKey && previousFileKey !== upload.Key) {
			await deleteChapterFileFromS3(previousFileKey)
		}

		const chapterVideoFileId = String(upload.Key).trim()
		const chapterVideoFileUrl = getLessonPlaybackUrl(chapterVideoFileId)
			|| getPublicBookUrlFromKey(chapterVideoFileId)
			|| undefined

		res.status(200).json({
			chapterId: String(chapter._id),
			lessonId: String(lesson._id),
			chapterVideoFileId,
			chapterVideoFileUrl,
			creatomateRenderId,
			pending: false,
			addedToLesson: true,
			hasCreatomateRenderPending: false,
			message: 'Video is ready and added to the lesson.',
			videoScript: formatVideoScript(lesson),
		})
	} catch (uploadErr) {
		console.error(uploadErr)
		res.status(502)
		throw new Error('Failed to upload the rendered video to storage.')
	}
})

// PUT /api/subjects/:id/book-chapters/:chapterId/tutor-video
const uploadChapterTutorVideo = asyncHandler(async (req, res) => {
	const { id, chapterId } = req.params
	const { subject } = await loadSubjectForBookChapters(req, res, id)

	if (!mongoose.Types.ObjectId.isValid(chapterId)) {
		res.status(400)
		throw new Error('Invalid chapter id')
	}

	const chapterIndex = (subject.bookChapters || []).findIndex(
		(item) => String(item._id) === String(chapterId),
	)

	if (chapterIndex < 0) {
		res.status(404)
		throw new Error('Chapter not found')
	}

	const chapter = subject.bookChapters[chapterIndex]
	const lesson = await BookLessons.findOne({
		subject: subject._id,
		'bookChapter.chapterId': chapter._id,
	})

	if (!lesson) {
		res.status(400)
		throw new Error(
			'This chapter has no web lesson yet. Generate the web lesson first.',
		)
	}

	if (!req.file?.buffer) {
		res.status(400)
		throw new Error('Video file is required')
	}

	const s3 = getS3()
	const bucket = getBookBucketName()
	if (!s3 || !bucket) {
		res.status(503)
		throw new Error(
			'File storage is not configured. Set AWS credentials and '
			+ 'AWS_S3_BUCKET.',
		)
	}

	const previousFileKey = chapterVideoFileIdFromLesson(lesson)
	const prefix = getBookKeyPrefix()
	const random = crypto.randomBytes(8).toString('hex')
	const slug = sanitizeChapterPdfSlug(
		chapter.ChapterTitle,
		chapter.ChapterNumber ?? chapterIndex + 1,
	)
	const ext = videoExtFromMime(
		req.file.mimetype,
		req.file.originalname,
	)
	const key = `${prefix}/${id}/chapters/${chapterId}-tutor-video-${slug}-${random}${ext}`

	const contentType = req.file.mimetype
		&& String(req.file.mimetype).trim() !== ''
		? req.file.mimetype
		: 'video/mp4'

	try {
		const upload = await s3.upload({
			Bucket: bucket,
			Key: key,
			Body: req.file.buffer,
			ContentType: contentType,
		}).promise()

		lesson.chapterVideoFileId = upload.Key
		await lesson.save()

		if (previousFileKey && previousFileKey !== upload.Key) {
			await deleteChapterFileFromS3(previousFileKey)
		}

		const chapterVideoFileId = String(upload.Key).trim()
		const chapterVideoFileUrl = getLessonPlaybackUrl(chapterVideoFileId)
			|| getPublicBookUrlFromKey(chapterVideoFileId)
			|| undefined

		res.status(200).json({
			chapterId: String(chapter._id),
			lessonId: String(lesson._id),
			chapterVideoFileId,
			chapterVideoFileUrl,
		})
	} catch (uploadErr) {
		console.error(uploadErr)
		res.status(502)
		throw new Error('Failed to upload the tutor video to storage.')
	}
})

// PUT /api/subjects/:id/book-chapters/:chapterId/tutor-transcribe
const uploadChapterTutorTranscribe = asyncHandler(async (req, res) => {
	const { id, chapterId } = req.params
	const { subject } = await loadSubjectForBookChapters(req, res, id)

	if (!mongoose.Types.ObjectId.isValid(chapterId)) {
		res.status(400)
		throw new Error('Invalid chapter id')
	}

	const chapterIndex = (subject.bookChapters || []).findIndex(
		(item) => String(item._id) === String(chapterId),
	)

	if (chapterIndex < 0) {
		res.status(404)
		throw new Error('Chapter not found')
	}

	const chapter = subject.bookChapters[chapterIndex]
	const lesson = await BookLessons.findOne({
		subject: subject._id,
		'bookChapter.chapterId': chapter._id,
	})

	if (!lesson) {
		res.status(400)
		throw new Error(
			'This chapter has no web lesson yet. Generate the web lesson first.',
		)
	}

	if (!chapterVideoFileIdFromLesson(lesson)) {
		res.status(400)
		throw new Error(
			'Upload the tutor video first before adding captions.',
		)
	}

	if (!req.file?.buffer) {
		res.status(400)
		throw new Error('Subtitle file (.srt) is required')
	}

	let vttContent
	try {
		vttContent = convertSrtToVtt(req.file.buffer)
	} catch (convertErr) {
		res.status(400)
		throw new Error(
			convertErr?.message
			|| 'Could not read the subtitle file. Use a valid .srt file.',
		)
	}

	const lessonContent = assignBlockIds(
		Array.isArray(lesson.content) ? lesson.content : [],
	)
	lesson.content = lessonContent

	const alignmentLesson = {
		content: lessonContent,
		mainTitle: lesson.mainTitle || '',
		unitTheme: lesson.unitTheme || '',
		heroSubtitle: lesson.heroSubtitle || '',
		objectivesText: lesson.objectivesText || '',
	}

	try {
		vttContent = annotateVttWithBlockIds(vttContent, alignmentLesson)
	} catch (alignErr) {
		console.error(alignErr)
		res.status(422)
		throw new Error(
			'Could not align captions to the lesson content. '
			+ 'Regenerate the web lesson and try again.',
		)
	}

	const s3 = getS3()
	const bucket = getBookBucketName()
	if (!s3 || !bucket) {
		res.status(503)
		throw new Error(
			'File storage is not configured. Set AWS credentials and '
			+ 'AWS_S3_BUCKET.',
		)
	}

	const previousFileKey = chapterTranscribeFileIdFromLesson(lesson)
	const prefix = getBookKeyPrefix()
	const random = crypto.randomBytes(8).toString('hex')
	const slug = sanitizeChapterPdfSlug(
		chapter.ChapterTitle,
		chapter.ChapterNumber ?? chapterIndex + 1,
	)
	const key = `${prefix}/${id}/chapters/${chapterId}-tutor-transcribe-${slug}-${random}.vtt`

	try {
		const upload = await s3.upload({
			Bucket: bucket,
			Key: key,
			Body: Buffer.from(vttContent, 'utf8'),
			ContentType: 'text/vtt; charset=utf-8',
		}).promise()

		lesson.chapterTranscribeFileId = upload.Key
		await lesson.save()

		if (previousFileKey && previousFileKey !== upload.Key) {
			await deleteChapterFileFromS3(previousFileKey)
		}

		const chapterTranscribeFileId = String(upload.Key).trim()
		const chapterTranscribeFileUrl = getPublicBookUrlFromKey(
			chapterTranscribeFileId,
		) || undefined

		res.status(200).json({
			chapterId: String(chapter._id),
			lessonId: String(lesson._id),
			chapterTranscribeFileId,
			chapterTranscribeFileUrl,
		})
	} catch (uploadErr) {
		console.error(uploadErr)
		res.status(502)
		throw new Error('Failed to upload the tutor captions to storage.')
	}
})

async function streamTranscribeFile (res, fileKey) {
	const s3 = getS3()
	const bucket = getBookBucketName()

	if (!s3 || !bucket) {
		res.status(503)
		throw new Error(
			'File storage is not configured. Set AWS credentials and '
			+ 'AWS_S3_BUCKET.',
		)
	}

	let object
	try {
		object = await s3.getObject({
			Bucket: bucket,
			Key: String(fileKey).trim(),
		}).promise()
	} catch (loadErr) {
		console.error(loadErr)
		res.status(502)
		throw new Error('Could not load the transcript from storage.')
	}

	const rawType = object.ContentType
		? String(object.ContentType)
		: ''
	const contentType = rawType.includes('vtt')
		? rawType
		: 'text/vtt; charset=utf-8'

	res.set({
		'Content-Type': contentType,
		'Cache-Control': 'private, max-age=3600',
	})
	res.status(200).send(object.Body)
}

// GET /api/book-lessons/:lessonId/transcribe — protectStudent
const getBookLessonTranscribeForStudent = asyncHandler(async (req, res) => {
	const { lessonId } = req.params

	if (!mongoose.Types.ObjectId.isValid(lessonId)) {
		res.status(400)
		throw new Error('Invalid lesson id')
	}

	const lesson = await BookLessons.findById(lessonId)

	if (!lesson) {
		res.status(404)
		throw new Error('Lesson not found')
	}

	await assertStudentCanAccessLesson(res, req.student._id, lesson)

	const fileKey = chapterTranscribeFileIdFromLesson(lesson)
	if (!fileKey) {
		res.status(404)
		throw new Error('This lesson has no transcript.')
	}

	await streamTranscribeFile(res, fileKey)
})

// GET /api/subjects/:id/book-lessons/:lessonId/transcribe — protectSchoolAdmin
const getBookLessonTranscribeForSchoolAdmin = asyncHandler(async (req, res) => {
	const { id, lessonId } = req.params
	await loadSubjectForBookChapters(req, res, id)

	if (!mongoose.Types.ObjectId.isValid(lessonId)) {
		res.status(400)
		throw new Error('Invalid lesson id')
	}

	const lesson = await BookLessons.findOne({
		_id: lessonId,
		subject: id,
	})

	if (!lesson) {
		res.status(404)
		throw new Error('Lesson not found')
	}

	const fileKey = chapterTranscribeFileIdFromLesson(lesson)
	if (!fileKey) {
		res.status(404)
		throw new Error('This lesson has no transcript.')
	}

	await streamTranscribeFile(res, fileKey)
})

export {
	getBookLessonById,
	getBookLessonByIdForSchoolAdmin,
	getBookLessonTranscribeForStudent,
	getBookLessonTranscribeForSchoolAdmin,
	getBookLessonsBySubject,
	getBookLessonsBySubjectForStudent,
	generateBookLessonsFromChapter,
	generateChapterTutorTxtFromLesson,
	generateSuggestedQuestionsFromLesson,
	generateVideoScriptFromLesson,
	generateVideoScriptAudioFromLesson,
	generateSceneIllustrationsFromLesson,
	generateAnimatedVideoFromLesson,
	checkAnimatedVideoStatusFromLesson,
	uploadChapterTutorVideo,
	uploadChapterTutorTranscribe,
	bookLessonToJson,
}
