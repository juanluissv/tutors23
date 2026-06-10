import Student from '../models/studentModel.js';

function slugPart (value, fallback) {
    const raw = String(value ?? '').trim().toLowerCase();
    const slug = raw
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '')
        .slice(0, 24);
    return slug !== '' ? slug : fallback;
}

function buildUsernameBase (firstname, lastname) {
    const first = slugPart(firstname, 'student');
    const last = slugPart(lastname, 'user');
    return `${first}.${last}`;
}

async function isUsernameTaken (username, excludeStudentId) {
    const query = { username };
    if (excludeStudentId != null) {
        query._id = { $ne: excludeStudentId };
    }
    return Boolean(await Student.exists(query));
}

/**
 * Unique username: firstname.lastname + numeric suffix.
 * Example: juan.smith.4821
 */
export async function generateUniqueStudentUsername ({
    firstname,
    lastname,
    excludeStudentId = null,
}) {
    const base = buildUsernameBase(firstname, lastname);
    let suffix = Math.floor(1000 + Math.random() * 9000);

    for (let attempt = 0; attempt <= 9999; attempt += 1) {
        const candidate = `${base}.${suffix}`;
        const taken = await isUsernameTaken(candidate, excludeStudentId);
        if (!taken) {
            return candidate;
        }
        suffix += 1;
    }

    return `${base}.${Date.now()}`;
}
