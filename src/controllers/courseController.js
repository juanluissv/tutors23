import asyncHandler from 'express-async-handler';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import Course from '../models/courseModel.js';
import Subject from '../models/subjectModel.js';
import Teacher from '../models/teacherModel.js';
import { assertSchoolAdminOwnsSchool } from './schoolController.js';
import {
	getBookBucketName,
	getCourseLessonVideoKeyPrefix,
	getLessonPlaybackUrl,
	getS3,
} from '../config/s3Client.js';
import { getStudentActiveSubscription } from './subscriptionController.js';

function toObjectIdString (val) {
	if (!val && val !== 0) {
		return '';
	}
	if (typeof val === 'object' && val !== null && val._id != null) {
		return String(val._id);
	}
	return String(val);
}

function nextSectionNumber (sections) {
	if (!Array.isArray(sections) || sections.length === 0) {
		return '1';
	}
	let max = 0;
	for (const s of sections) {
		const n = parseInt(String(s.sectionNumber ?? ''), 10);
		if (!Number.isNaN(n) && n > max) max = n;
	}
	return String(max + 1);
}

function nextLessonNumber (lessons) {
	if (!Array.isArray(lessons) || lessons.length === 0) {
		return '1';
	}
	let max = 0;
	for (const l of lessons) {
		const n = parseInt(String(l.lessonNumber ?? ''), 10);
		if (!Number.isNaN(n) && n > max) max = n;
	}
	return String(max + 1);
}

async function fetchCourseOwnedByTeacher (courseId, teacherId, res) {
	if (!mongoose.Types.ObjectId.isValid(String(courseId))) {
		res.status(400);
		throw new Error('Invalid course id');
	}

	const course = await Course.findById(courseId);

	if (!course) {
		res.status(404);
		throw new Error('Course not found');
	}

	if (String(course.teacher) !== String(teacherId)) {
		res.status(403);
		throw new Error('Not authorized to edit this course');
	}

	return course;
}

async function fetchCourseForEnrolledStudent (courseId, studentId, res) {
	if (!mongoose.Types.ObjectId.isValid(String(courseId))) {
		res.status(400);
		throw new Error('Invalid course id');
	}

	const studentIdStr = String(studentId);
	const course = await Course.findById(courseId);

	if (!course) {
		res.status(404);
		throw new Error('Course not found');
	}

	if (course.isPublish !== true) {
		res.status(403);
		throw new Error('This course is not published yet');
	}

	const subjectRef = course.subject;
	if (!subjectRef) {
		res.status(403);
		throw new Error('Course is not available');
	}

	const subject = await Subject.findById(subjectRef).select('students').lean();

	if (!subject) {
		res.status(404);
		throw new Error('Subject not found');
	}

	const enrolled = Array.isArray(subject.students)
		&& subject.students.some((s) => String(s) === studentIdStr);

	if (!enrolled) {
		res.status(403);
		throw new Error('You are not enrolled in this course');
	}

	return course;
}

async function fetchCourseForSchoolAdmin (courseId, schoolAdminId, res) {
	if (!mongoose.Types.ObjectId.isValid(String(courseId))) {
		res.status(400);
		throw new Error('Invalid course id');
	}

	const course = await Course.findById(courseId);

	if (!course) {
		res.status(404);
		throw new Error('Course not found');
	}

	const subject = await Subject.findById(course.subject)
		.select('school')
		.lean();

	if (!subject) {
		res.status(404);
		throw new Error('Subject not found');
	}

	if (!subject.school) {
		res.status(400);
		throw new Error('Subject is not linked to a school');
	}

	await assertSchoolAdminOwnsSchool(
		res,
		schoolAdminId,
		subject.school,
	);

	return course;
}

// POST /api/courses — use with protectTeacher (teacher from session)
const createCourse = asyncHandler(async (req, res) => {
	const {
		title,
		description,
		teacher: teacherFromBody,
		subject: subjectFromBody,
	} = req.body;

	if (!title || String(title).trim() === '') {
		res.status(400);
		throw new Error('Course title is required');
	}

	const teacherIdStr = req.teacher?._id
		? String(req.teacher._id)
		: toObjectIdString(teacherFromBody);

	if (
		req.teacher?._id
		&& teacherFromBody != null
		&& toObjectIdString(teacherFromBody)
		&& toObjectIdString(teacherFromBody) !== String(req.teacher._id)
	) {
		res.status(403);
		throw new Error('Not authorized to create a course for another teacher');
	}

	const subjectIdStr = toObjectIdString(subjectFromBody);

	if (!teacherIdStr || !mongoose.Types.ObjectId.isValid(teacherIdStr)) {
		res.status(400);
		throw new Error('Valid teacher id is required');
	}

	if (!subjectIdStr || !mongoose.Types.ObjectId.isValid(subjectIdStr)) {
		res.status(400);
		throw new Error('Valid subject id is required');
	}

	const [teacherDoc, subjectDoc] = await Promise.all([
		Teacher.findById(teacherIdStr).select('_id').lean(),
		Subject.findById(subjectIdStr).select('_id').lean(),
	]);

	if (!teacherDoc) {
		res.status(404);
		throw new Error('Teacher not found');
	}

	if (!subjectDoc) {
		res.status(404);
		throw new Error('Subject not found');
	}

	const payload = {
		title: String(title).trim(),
		isPublish: false,
		teacher: teacherIdStr,
		subject: subjectIdStr,
	};

	if (description !== undefined && description !== null) {
		payload.description = String(description).trim();
	}

	const course = await Course.create(payload);

	res.status(201).json(course);
});

// GET /api/courses/subject/:subjectId — protectTeacher
const getCoursesBySubjectForTeacher = asyncHandler(
	async (req, res) => {
		const { subjectId } = req.params;

		if (!mongoose.Types.ObjectId.isValid(subjectId)) {
			res.status(400);
			throw new Error('Invalid subject id');
		}

		const teacherId = req.teacher._id;
		const subject = await Subject.findById(subjectId)
			.select('teachers')
			.lean();

		if (!subject) {
			res.status(404);
			throw new Error('Subject not found');
		}

		const tid = String(teacherId);
		const allowed = Array.isArray(subject.teachers)
			&& subject.teachers.some((t) => String(t) === tid);

		if (!allowed) {
			res.status(403);
			throw new Error(
				'Not authorized to view courses for this subject',
			);
		}

		const courses = await Course.find({
			subject: subjectId,
			teacher: teacherId,
		})
			.sort({ createdAt: -1 })
			.lean();

		res.status(200).json(courses);
	},
);

// GET /api/courses/school-admin/subject/:subjectId — protectSchoolAdmin
const getCoursesBySubjectForSchoolAdmin = asyncHandler(
	async (req, res) => {
		const { subjectId } = req.params;

		if (!mongoose.Types.ObjectId.isValid(subjectId)) {
			res.status(400);
			throw new Error('Invalid subject id');
		}

		const subject = await Subject.findById(subjectId)
			.select('school')
			.lean();

		if (!subject) {
			res.status(404);
			throw new Error('Subject not found');
		}

		if (!subject.school) {
			res.status(400);
			throw new Error('Subject is not linked to a school');
		}

		await assertSchoolAdminOwnsSchool(
			res,
			req.schoolAdmin._id,
			subject.school,
		);

		const courses = await Course.find({ subject: subjectId })
			.sort({ createdAt: -1 })
			.populate('teacher', 'firstname lastname email')
			.lean();

		res.status(200).json(courses);
	},
);

// GET /api/courses/student/subject/:subjectId — protectStudent — published only
const getPublishedCoursesBySubjectForStudent = asyncHandler(
	async (req, res) => {
		const { subjectId } = req.params;

		if (!mongoose.Types.ObjectId.isValid(subjectId)) {
			res.status(400);
			throw new Error('Invalid subject id');
		}

		const studentIdStr = String(req.student._id);
		const subject = await Subject.findById(subjectId)
			.select('students')
			.lean();

		if (!subject) {
			res.status(404);
			throw new Error('Subject not found');
		}

		const enrolled = Array.isArray(subject.students)
			&& subject.students.some((s) => String(s) === studentIdStr);

		if (!enrolled) {
			res.status(403);
			throw new Error(
				'You are not enrolled in this subject',
			);
		}

		const subscription = await getStudentActiveSubscription(
			req.student._id,
		);
		if (!subscription) {
			res.status(403);
			throw new Error(
				'An active subscription is required to view courses',
			);
		}

		const courses = await Course.find({
			subject: subjectId,
			isPublish: true,
		})
			.sort({ createdAt: -1 })
			.select(
				'_id title description isPublish subject createdAt updatedAt',
			)
			.lean();

		res.status(200).json(courses);
	},
);

// GET /api/courses/:courseId — protectTeacher
const getCourseByIdForTeacher = asyncHandler(async (req, res) => {
	const { courseId } = req.params;

	const course = await fetchCourseOwnedByTeacher(
		courseId,
		req.teacher._id,
		res,
	);

	res.status(200).json(course);
});

// GET /api/courses/:courseId/preview — protectTeacher — lessons + video URLs
const getCoursePreviewForTeacher = asyncHandler(
	async (req, res) => {
		const { courseId } = req.params;

		const course = await fetchCourseOwnedByTeacher(
			courseId,
			req.teacher._id,
			res,
		);

		const plain = typeof course.toObject === 'function'
			? course.toObject()
			: JSON.parse(JSON.stringify(course));

		const lessonList = Array.isArray(plain.lessons)
			? plain.lessons
			: [];

		plain.lessons = lessonList.map((lesson) => ({
			...lesson,
			videoUrl: getLessonPlaybackUrl(lesson?.mediaId),
		}));

		res.status(200).json(plain);
	},
);

// GET /api/courses/:courseId/school-admin/preview — protectSchoolAdmin
const getCoursePreviewForSchoolAdmin = asyncHandler(
	async (req, res) => {
		const { courseId } = req.params;

		const course = await fetchCourseForSchoolAdmin(
			courseId,
			req.schoolAdmin._id,
			res,
		);

		const plain = typeof course.toObject === 'function'
			? course.toObject()
			: JSON.parse(JSON.stringify(course));

		const lessonList = Array.isArray(plain.lessons)
			? plain.lessons
			: [];

		plain.lessons = lessonList.map((lesson) => ({
			...lesson,
			videoUrl: getLessonPlaybackUrl(lesson?.mediaId),
		}));

		res.status(200).json(plain);
	},
);

function parsePublishBodyBoolean (raw) {
	if (raw === true || raw === 'true' || raw === '1' || raw === 1) {
		return true;
	}
	if (
		raw === false
		|| raw === 'false'
		|| raw === '0'
		|| raw === 0
		|| raw === ''
		|| raw === null
	) {
		return false;
	}
	return undefined;
}

// PATCH /api/courses/:courseId/publish — protectTeacher — JSON { isPublish }
const setCoursePublishForTeacher = asyncHandler(async (req, res) => {
	const { courseId } = req.params;

	const body = req.body !== null && typeof req.body === 'object'
		? req.body
		: {};

	if (!('isPublish' in body)) {
		res.status(400);
		throw new Error('isPublish is required');
	}

	const isPublish = parsePublishBodyBoolean(body.isPublish);

	if (typeof isPublish !== 'boolean') {
		res.status(400);
		throw new Error('Invalid isPublish value');
	}

	const course = await fetchCourseOwnedByTeacher(
		courseId,
		req.teacher._id,
		res,
	);

	course.isPublish = isPublish;
	await course.save();

	res.status(200).json(course);
});

// GET /api/courses/:courseId/watch — protectStudent — published + enrollment
const getCourseWatchForStudent = asyncHandler(async (req, res) => {
	const { courseId } = req.params;

	const subscription = await getStudentActiveSubscription(req.student._id);
	if (!subscription) {
		res.status(403);
		throw new Error(
			'An active subscription is required to watch courses',
		);
	}

	const course = await fetchCourseForEnrolledStudent(
		courseId,
		req.student._id,
		res,
	);

	const plain = typeof course.toObject === 'function'
		? course.toObject()
		: JSON.parse(JSON.stringify(course));

	const lessonList = Array.isArray(plain.lessons)
		? plain.lessons
		: [];

	plain.lessons = lessonList.map((lesson) => ({
		...lesson,
		videoUrl: getLessonPlaybackUrl(lesson?.mediaId),
	}));

	res.status(200).json(plain);
});

// POST /api/courses/:courseId/sections — protectTeacher — JSON body
const addSectionToCourse = asyncHandler(async (req, res) => {
	const { courseId } = req.params;

	const course = await fetchCourseOwnedByTeacher(
		courseId,
		req.teacher._id,
		res,
	);

	const rawName = req.body.sectionTitle ?? req.body.sectionName ?? '';
	const sectionTitle = String(rawName).trim();

	if (!sectionTitle) {
		res.status(400);
		throw new Error('Section name is required');
	}

	const sectionNumber = nextSectionNumber(course.sections || []);

	if (!Array.isArray(course.sections)) {
		course.sections = [];
	}

	course.sections.push({ sectionNumber, sectionTitle });

	await course.save();

	res.status(200).json(course);
});

function videoExtFromMime (mime, originalName) {
	const m = String(mime || '').toLowerCase();
	const n = String(originalName || '').toLowerCase();
	if (m.includes('mp4') || n.endsWith('.mp4')) {
		return '.mp4';
	}
	if (m.includes('quicktime') || n.endsWith('.mov')) {
		return '.mov';
	}
	return '.webm';
}

// POST /api/courses/:courseId/lessons — protectTeacher — multipart (+ video)
const addLessonToCourse = asyncHandler(async (req, res) => {
	const { courseId } = req.params;

	const course = await fetchCourseOwnedByTeacher(
		courseId,
		req.teacher._id,
		res,
	);

	const titleTrim = String(req.body.title ?? '').trim();
	const sectionNumber = String(req.body.sectionNumber ?? '').trim();

	if (!titleTrim) {
		res.status(400);
		throw new Error('Lesson title is required');
	}

	if (!sectionNumber) {
		res.status(400);
		throw new Error('Course section is required');
	}

	if (!req.file?.buffer) {
		res.status(400);
		throw new Error('Video file is required');
	}

	const sections = Array.isArray(course.sections)
		? course.sections
		: [];
	const sectionMatch = sections.find(
		(s) => String(s.sectionNumber ?? '') === sectionNumber,
	);

	if (!sectionMatch) {
		res.status(400);
		throw new Error(
			'That section does not exist. Add it in step (1) first.',
		);
	}

	const s3 = getS3();
	const bucket = getBookBucketName();

	if (!s3 || !bucket) {
		res.status(503);
		throw new Error(
			'File storage is not configured. Set AWS credentials and '
				+ 'AWS_S3_BUCKET.',
		);
	}

	const lessonNum = nextLessonNumber(course.lessons || []);
	const prefix = getCourseLessonVideoKeyPrefix();
	const random = crypto.randomBytes(8).toString('hex');
	const ext = videoExtFromMime(
		req.file.mimetype,
		req.file.originalname,
	);
	const key = `${prefix}/${courseId}/${lessonNum}-${random}${ext}`;

	const contentType = req.file.mimetype
		&& String(req.file.mimetype).trim() !== ''
		? req.file.mimetype
		: 'video/webm';

	try {
		const upload = await s3.upload({
			Bucket: bucket,
			Key: key,
			Body: req.file.buffer,
			ContentType: contentType,
		}).promise();

		const descTrim = String(req.body.description ?? '').trim();

		if (!Array.isArray(course.lessons)) {
			course.lessons = [];
		}

		const lessonPayload = {
			title: titleTrim,
			sectionNumber,
			section: String(sectionMatch.sectionTitle ?? '').trim(),
			mediaId: upload.Key,
			lessonNumber: lessonNum,
		};

		if (descTrim) {
			lessonPayload.description = descTrim;
		}

		course.lessons.push(lessonPayload);

		await course.save();

		res.status(201).json(course);
	}
	catch (err) {
		console.error(err);
		res.status(502);
		throw new Error('Failed to upload the lesson video.');
	}
});

export {
	addLessonToCourse,
	addSectionToCourse,
	createCourse,
	setCoursePublishForTeacher,
	getPublishedCoursesBySubjectForStudent,
	getCourseByIdForTeacher,
	getCoursePreviewForTeacher,
	getCoursePreviewForSchoolAdmin,
	getCourseWatchForStudent,
	getCoursesBySubjectForTeacher,
	getCoursesBySubjectForSchoolAdmin,
};
