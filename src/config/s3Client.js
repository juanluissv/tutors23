import AWS from 'aws-sdk';

/**
 * Robust .env parsing: trim whitespace and strip one pair of surrounding
 * quotes (common when copying Heroku/Bucketeer values into .env).
 */
function readEnv (key) {
    const raw = process.env[key];
    if (raw == null) {
        return null;
    }
    let s = String(raw).trim();
    if (
        (s.startsWith('"') && s.endsWith('"'))
        || (s.startsWith("'") && s.endsWith("'"))
    ) {
        s = s.slice(1, -1).trim();
    }
    return s === '' ? null : s;
}

const region = readEnv('AWS_REGION') || 'us-east-1';

let s3 = null;

/**
 * S3 client from env. Never hardcode access keys in source.
 * AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET
 *
 * If uploads fail with getaddrinfo ENOTFOUND on *.s3.amazonaws.com:
 * - Set AWS_REGION to the bucket’s real region
 *   (e.g. aws s3api get-bucket-location --bucket YOUR_BUCKET).
 * - Ensure DNS/firewall/VPN allows *.amazonaws.com (try ping/nslookup).
 * - Avoid stray characters in AWS_S3_BUCKET (use readEnv-friendly .env).
 */
function getS3 () {
    if (s3) {
        return s3;
    }
    const accessKeyId = readEnv('AWS_ACCESS_KEY_ID');
    const secretAccessKey = readEnv('AWS_SECRET_ACCESS_KEY');
    if (!accessKeyId || !secretAccessKey) {
        return null;
    }
    const cfg = {
        accessKeyId,
        secretAccessKey,
        region,
        signatureVersion: 'v4',
    };
    const endpoint = readEnv('AWS_S3_ENDPOINT');
    if (endpoint) {
        cfg.endpoint = endpoint;
        cfg.s3ForcePathStyle = true;
    }
    s3 = new AWS.S3(cfg);
    return s3;
}

function getBookBucketName () {
    return readEnv('AWS_S3_BUCKET');
}

/** Prefix for course PDF keys, no leading/trailing slash issues */
function getBookKeyPrefix () {
    const p = (readEnv('AWS_S3_BOOK_PREFIX') || 'public/books').replace(
        /^\/+|\/+$/g,
        '',
    );
    return p;
}

/** Prefix for student question screen recordings */
function getQuestionVideoKeyPrefix () {
    const p = (
        readEnv('AWS_S3_QUESTION_VIDEO_PREFIX') || 'public/question-videos'
    ).replace(
        /^\/+|\/+$/g,
        '',
    );
    return p;
}

/** Prefix for teacher answer screen recordings */
function getAnswerVideoKeyPrefix () {
    const p = (
        readEnv('AWS_S3_ANSWER_VIDEO_PREFIX') || 'public/answer-videos'
    ).replace(
        /^\/+|\/+$/g,
        '',
    );
    return p;
}

/**
 * Public GET URL for an object key when objects are readable anonymously
 * (e.g. Bucketeer public bucket). Set AWS_S3_PUBLIC_BASE_URL with no trailing
 * slash. For non–us-east-1 buckets, prefer the regional form
 * https://BUCKET.s3.REGION.amazonaws.com
 */
function getPublicBookUrlFromKey (objectKey) {
    if (!objectKey || typeof objectKey !== 'string') {
        return null;
    }
    const baseRaw = readEnv('AWS_S3_PUBLIC_BASE_URL');
    const base = typeof baseRaw === 'string'
        ? baseRaw.trim().replace(/\/+$/, '')
        : '';
    if (!base) {
        return null;
    }
    const segments = objectKey.split('/').filter(Boolean);
    if (segments.length === 0) {
        return null;
    }
    const path = segments.map((segment) => encodeURIComponent(segment)).join('/');
    return `${base}/${path}`;
}

export {
    getS3,
    getBookBucketName,
    getBookKeyPrefix,
    getQuestionVideoKeyPrefix,
    getAnswerVideoKeyPrefix,
    getPublicBookUrlFromKey,
};
