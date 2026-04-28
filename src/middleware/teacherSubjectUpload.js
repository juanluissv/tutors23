import multer from 'multer';

const MAX_BYTES = 25 * 1024 * 1024;

const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const isPdf
        = file.mimetype === 'application/pdf'
        || (file.originalname && file.originalname.toLowerCase().endsWith('.pdf'));
    if (isPdf) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'));
    }
};

const bookUpload = multer({
    storage: memoryStorage,
    limits: { fileSize: MAX_BYTES },
    fileFilter,
});

const uploadBookSingle = bookUpload.single('book');

/**
 * Only parse multipart for PUT /:id/teacher; JSON + express.json for other
 * content types.
 */
function parseTeacherSubjectMultipart (req, res, next) {
    const ct = (req.headers['content-type'] || '');
    if (ct.includes('multipart/form-data')) {
        return uploadBookSingle(req, res, (err) => {
            if (!err) {
                return next();
            }
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    res.status(400);
                    return res.json({
                        message: 'File too large. Maximum size is 25 MB.',
                    });
                }
                res.status(400);
                return res.json({
                    message: 'Invalid file upload. Use a single PDF file.',
                });
            }
            if (err instanceof Error) {
                res.status(400);
                return res.json({ message: err.message });
            }
            return next(err);
        });
    }
    next();
}

export { parseTeacherSubjectMultipart, MAX_BYTES };
