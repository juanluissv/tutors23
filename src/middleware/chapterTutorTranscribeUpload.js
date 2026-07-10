import multer from 'multer'

/** HeyGen SRT captions are small text files. */
const MAX_BYTES = 5 * 1024 * 1024

const memoryStorage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
	const mime = (file.mimetype || '').toLowerCase()
	const name = (file.originalname || '').toLowerCase()
	const ok = (
		mime === 'text/plain'
		|| mime === 'application/octet-stream'
		|| mime === 'application/x-subrip'
		|| name.endsWith('.srt')
	)
	if (ok) {
		cb(null, true)
	} else {
		cb(new Error('Only .srt subtitle uploads are allowed.'))
	}
}

const transcribeUpload = multer({
	storage: memoryStorage,
	limits: { fileSize: MAX_BYTES },
	fileFilter,
})

const uploadChapterTutorTranscribeSingle = transcribeUpload.single('transcribe')

function parseChapterTutorTranscribe (req, res, next) {
	return uploadChapterTutorTranscribeSingle(req, res, (err) => {
		if (!err) {
			return next()
		}
		if (err instanceof multer.MulterError) {
			if (err.code === 'LIMIT_FILE_SIZE') {
				res.status(400)
				return res.json({
					message:
						`File too large. Maximum size is ${Math.round(MAX_BYTES / (1024 * 1024))} MB.`,
				})
			}
			res.status(400)
			return res.json({
				message: 'Invalid file upload. Send a single .srt file.',
			})
		}
		if (err instanceof Error) {
			res.status(400)
			return res.json({ message: err.message })
		}
		return next(err)
	})
}

export {
	parseChapterTutorTranscribe,
	MAX_BYTES as MAX_CHAPTER_TUTOR_TRANSCRIBE_BYTES,
}
