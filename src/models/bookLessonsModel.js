import mongoose from 'mongoose'

const lessonElementSchema = {
	type: {
		type: String,
		required: true,
		enum: [
			'eyebrow',
			'h1',
			'h2',
			'h3',
			'h4',
			'h5',
			'p',
			'objectives',
			'phase',
			'activity',
			'doc',
			'info',
			'glossary',
			'profundizacion',
			'numberedList',
			'bulletList',
			'table',
			'chart',
			'diagram',
			'map',
			'figure',
			'chips',
		],
	},
	text: {
		type: String,
		required: false,
	},
	items: [
		{
			label: { type: String, required: false },
			title: { type: String, required: false },
			body: { type: String, required: false },
			text: { type: String, required: false },
			value: { type: String, required: false },
			cells: { type: [String], required: false },
		},
	],
	meta: {
		activityNumber: { type: Number, required: false },
		activityKind: { type: String, required: false },
		badge: { type: String, required: false },
		docNumber: { type: String, required: false },
		phase: { type: String, required: false },
		chartKind: { type: String, required: false },
		unit: { type: String, required: false },
		headers: { type: [String], required: false },
	},
}

const bookLessonsSchema = mongoose.Schema({
	mainTitle: {
		type: String,
		required: true,
	},
	unitTheme: {
		type: String,
		required: false,
	},
	heroSubtitle: {
		type: String,
		required: false,
	},
	objectivesText: {
		type: String,
		required: false,
	},
	content: [lessonElementSchema],
	dateCreated: {
		type: Date,
		required: false,
	},
	subject: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'Subject',
	},
	bookChapter: {
		chapterId: {
			type: mongoose.Schema.Types.ObjectId,
			required: false,
		},
	},
}, {
	timestamps: true,
})

const BookLessons = mongoose.model('BookLessons', bookLessonsSchema)

export default BookLessons
