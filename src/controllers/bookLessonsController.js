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
	loadSubjectForSchoolAdmin,
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

function bookLessonIndexToJson (lesson) {
	const content = Array.isArray(lesson.content) ? lesson.content : []
	const chapterVideoFileId = chapterVideoFileIdFromLesson(lesson)
	const chapterTranscribeFileId = chapterTranscribeFileIdFromLesson(lesson)

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

function bookLessonToJson (lesson, subjectMeta = {}) {
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
	const subject = await Subject.findById(lesson.subject).select('students title')

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
		lessons.map((lesson) => bookLessonIndexToJson(lesson)),
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
	}))
})

// GET /api/subjects/:id/book-lessons — protectSchoolAdmin
const getBookLessonsBySubject = asyncHandler(async (req, res) => {
	const { id } = req.params
	await loadSubjectForSchoolAdmin(req, res, id)

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
const generateBookLessonsFromChapter = asyncHandler(async (req, res) => {
	const { id, chapterId } = req.params
	const { subject } = await loadSubjectForSchoolAdmin(req, res, id)

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
const getBookLessonByIdForSchoolAdmin = asyncHandler(async (req, res) => {
	const { id, lessonId } = req.params
	await loadSubjectForSchoolAdmin(req, res, id)

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

	const subject = await Subject.findById(id).select('title')

	res.status(200).json(bookLessonToJson(lesson, {
		_id: subject?._id,
		title: subject?.title,
	}))
})

// POST /api/subjects/:id/book-chapters/:chapterId/generate-tutor-txt
const generateChapterTutorTxtFromLesson = asyncHandler(async (req, res) => {
	const { id, chapterId } = req.params
	const { subject } = await loadSubjectForSchoolAdmin(req, res, id)

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

// PUT /api/subjects/:id/book-chapters/:chapterId/tutor-video
const uploadChapterTutorVideo = asyncHandler(async (req, res) => {
	const { id, chapterId } = req.params
	const { subject } = await loadSubjectForSchoolAdmin(req, res, id)

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
	const { subject } = await loadSubjectForSchoolAdmin(req, res, id)

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
	await loadSubjectForSchoolAdmin(req, res, id)

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
	uploadChapterTutorVideo,
	uploadChapterTutorTranscribe,
	bookLessonToJson,
}
