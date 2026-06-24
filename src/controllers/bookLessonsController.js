import asyncHandler from 'express-async-handler'
import mongoose from 'mongoose'
import BookLessons from '../models/bookLessonsModel.js'
import Subject from '../models/subjectModel.js'
import { getS3, getBookBucketName } from '../config/s3Client.js'
import { extractTextFromPdfBuffer } from '../utils/extractChapterPdfText.js'
import { parseChapterPdfText } from '../utils/parseChapterPdfText.js'
import {
	extractLessonFromPdfWithVision,
	isVisionEnabled,
} from '../utils/visionExtractChapter.js'
import {
	chapterMainTitle,
	loadSubjectForSchoolAdmin,
} from './subjectController.js'

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

function bookLessonToJson (lesson, subjectMeta = {}) {
	const content = Array.isArray(lesson.content)
		? lesson.content.map((block) => {
			if (block.type) {
				return {
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
				type: block.subtitle ? 'h3' : 'p',
				text: block.subtitle || block.text || '',
				items: block.text && block.subtitle
					? [{ text: block.text }]
					: [],
				meta: {},
			}
		})
		: []

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
	}
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
		.sort({ createdAt: 1 })
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
				content: parsed.content,
				subject: subject._id,
				bookChapter: { chapterId: chapter._id },
				dateCreated: new Date(),
			},
		},
		{
			new: true,
			upsert: true,
			setDefaultsOnInsert: true,
		},
	)

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

export {
	getBookLessonById,
	getBookLessonByIdForSchoolAdmin,
	getBookLessonsBySubject,
	generateBookLessonsFromChapter,
	bookLessonToJson,
}
