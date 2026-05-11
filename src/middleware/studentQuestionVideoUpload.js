import multer from 'multer'

/** ~5 min screen recording (webm) can be large / 200 mb max */
const MAX_BYTES = 200 * 1024 * 1024

const memoryStorage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
	const mime = (file.mimetype || '').toLowerCase()
	const name = (file.originalname || '').toLowerCase()
	const ok = (
		mime === 'video/webm'
		|| mime === 'video/x-webm'
		|| mime === 'application/octet-stream'
		|| mime.startsWith('video/')
		|| name.endsWith('.webm')
	)
	if (ok) {
		cb(null, true)
	} else {
		cb(new Error('Only video uploads are allowed (e.g. WebM).'))
	}
}

const videoUpload = multer({
	storage: memoryStorage,
	limits: { fileSize: MAX_BYTES },
	fileFilter,
})

const uploadQuestionVideoSingle = videoUpload.single('video')

function parseStudentQuestionVideo (req, res, next) {
	return uploadQuestionVideoSingle(req, res, (err) => {
		if (!err) {
			return next()
		}
		if (err instanceof multer.MulterError) {
			if (err.code === 'LIMIT_FILE_SIZE') {
				res.status(400)
				return res.json({
					message: `File too large. Maximum size is ${Math.round(MAX_BYTES / (1024 * 1024))} MB.`,
				})
			}
			res.status(400)
			return res.json({
				message: 'Invalid file upload. Send a single video file.',
			})
		}
		if (err instanceof Error) {
			res.status(400)
			return res.json({ message: err.message })
		}
		return next(err)
	})
}

export { parseStudentQuestionVideo, MAX_BYTES as MAX_QUESTION_VIDEO_BYTES }
