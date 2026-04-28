import AWS from 'aws-sdk';

const region = process.env.AWS_REGION || 'us-east-1';

let s3 = null;

/**
 * S3 client from env. Never hardcode access keys in source.
 * AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET
 */
function getS3 () {
    if (s3) {
        return s3;
    }
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    if (!accessKeyId || !secretAccessKey) {
        return null;
    }
    s3 = new AWS.S3({ accessKeyId, secretAccessKey, region });
    return s3;
}

function getBookBucketName () {
    return process.env.AWS_S3_BUCKET || null;
}

/** Prefix for course PDF keys, no leading/trailing slash issues */
function getBookKeyPrefix () {
    const p = (process.env.AWS_S3_BOOK_PREFIX || 'public/books').replace(
        /^\/+|\/+$/g,
        '',
    );
    return p;
}

/**
 * Public GET URL for an object key when objects are readable anonymously
 * (e.g. Bucketeer public bucket). Set AWS_S3_PUBLIC_BASE_URL with no trailing
 * slash, e.g. https://my-bucket.s3.amazonaws.com
 */
function getPublicBookUrlFromKey (objectKey) {
    if (!objectKey || typeof objectKey !== 'string') {
        return null;
    }
    const baseRaw = process.env.AWS_S3_PUBLIC_BASE_URL;
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
    getPublicBookUrlFromKey,
};
