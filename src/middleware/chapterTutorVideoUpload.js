import multer from 'multer'

/** HeyGen chapter tutor videos can be several minutes (MP4). */
const MAX_BYTES = 500 * 1024 * 1024

const memoryStorage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
	const mime = (file.mimetype || '').toLowerCase()
	const name = (file.originalname || '').toLowerCase()
	const ok = (
		mime.startsWith('video/')
		|| mime === 'application/octet-stream'
		|| name.endsWith('.mp4')
		|| name.endsWith('.webm')
		|| name.endsWith('.mov')
	)
	if (ok) {
		cb(null, true)
	} else {
		cb(new Error('Only video uploads are allowed (e.g. MP4, WebM).'))
	}
}

const videoUpload = multer({
	storage: memoryStorage,
	limits: { fileSize: MAX_BYTES },
	fileFilter,
})

const uploadChapterTutorVideoSingle = videoUpload.single('video')

function parseChapterTutorVideo (req, res, next) {
	return uploadChapterTutorVideoSingle(req, res, (err) => {
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

export {
	parseChapterTutorVideo,
	MAX_BYTES as MAX_CHAPTER_TUTOR_VIDEO_BYTES,
}
