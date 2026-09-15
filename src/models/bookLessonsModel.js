import mongoose from 'mongoose'

const lessonElementSchema = {
	blockId: {
		type: String,
		required: false,
	},
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
		isTemplate: { type: Boolean, required: false },
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
	suggestedQuestions: [
		{
			question: {
				type: String,
				required: false,
			},
			answer: {
				type: String,
				required: false,
			},
			questionVideoUrl: {
				type: String,
				required: false,
			},
			answerVideoUrl: {
				type: String,
				required: false,
			},
		},
	],
	videoScript: {
		title: {
			type: String,
			required: false,
		},
		language: {
			type: String,
			required: false,
			default: 'es',
		},
		fullNarration: {
			type: String,
			required: false,
		},
		estimatedDurationSeconds: {
			type: Number,
			required: false,
		},
		audioDurationSeconds: {
			type: Number,
			required: false,
		},
		scenes: [
			{
				sceneNumber: { type: Number, required: false },
				type: {
					type: String,
					required: false,
					enum: [
						'title',
						'objectives',
						'concept',
						'definition',
						'chart',
						'map',
						'bulletList',
						'regional',
						'summary',
						'outro',
					],
				},
				title: { type: String, required: false },
				subtitle: { type: String, required: false },
				narration: { type: String, required: false },
				durationSeconds: { type: Number, required: false },
				visualNotes: { type: String, required: false },
				imagePrompt: { type: String, required: false },
				illustrationFileId: { type: String, required: false },
				illustrationGeneratedAt: { type: Date, required: false },
				term: { type: String, required: false },
				definition: { type: String, required: false },
				items: [
					{
						title: { type: String, required: false },
						body: { type: String, required: false },
						label: { type: String, required: false },
						value: { type: String, required: false },
					},
				],
				data: [
					{
						label: { type: String, required: false },
						value: { type: Number, required: false },
					},
				],
				regions: [{ type: String, required: false }],
			},
		],
		generatedAt: {
			type: Date,
			required: false,
		},
		audioGeneratedAt: {
			type: Date,
			required: false,
		},
		audioVoice: {
			type: String,
			required: false,
		},
		illustrationsGeneratedAt: {
			type: Date,
			required: false,
		},
		videoRenderedAt: {
			type: Date,
			required: false,
		},
	},
	videoScriptAudioFileId: {
		type: String,
		required: false,
	},
	creatomateRenderId: {
		type: String,
		required: false,
	},
	creatomateRenderStatus: {
		type: String,
		required: false,
	},
	creatomateRenderRequestedAt: {
		type: Date,
		required: false,
	},
	dateCreated: {
		type: Date,
		required: false,
	},
	subject: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'Subject',
	},
	chapterVideoFileId: {
		type: String,
		required: false,
	},
	chapterTranscribeFileId: {
		type: String,
		required: false,
	},
	bookChapter: {
		chapterId: {
			type: mongoose.Schema.Types.ObjectId,
			required: false,
		},
		chapterNumber: {
			type: Number,
			required: false,
		},
		chapterTitle: {
			type: String,
			required: false,
		},
	},
}, {
	timestamps: true,
})

const BookLessons = mongoose.model('BookLessons', bookLessonsSchema)

export default BookLessons
