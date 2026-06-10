/**
 * Fixes legacy student indexes and data:
 * - Drops unique email_1 (blocks multiple students without email)
 * - Assigns usernames to students missing one (blocks username_1 sync)
 *
 * Run: npm run db:fix-student-email-index
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../src/config/db.js';
import Student from '../src/models/studentModel.js';
import { generateUniqueStudentUsername } from '../src/utils/studentUsername.js';

dotenv.config();

async function run () {
    await connectDB();

    const collection = Student.collection;
    const indexes = await collection.indexes();
    const emailIndex = indexes.find((idx) => idx.name === 'email_1');

    if (emailIndex?.unique) {
        await collection.dropIndex('email_1');
        console.log('Dropped unique index email_1 on students');
    } else if (emailIndex) {
        console.log('email_1 exists but is not unique — no drop needed');
    } else {
        console.log('No email_1 index on students');
    }

    const unsetEmail = await Student.updateMany(
        { $or: [{ email: null }, { email: '' }] },
        { $unset: { email: '' } },
    );
    console.log(
        `Unset empty/null email on ${unsetEmail.modifiedCount} student(s)`,
    );

    const missingUsername = await Student.find({
        $or: [
            { username: null },
            { username: '' },
            { username: { $exists: false } },
        ],
    });

    for (const student of missingUsername) {
        const username = await generateUniqueStudentUsername({
            firstname: student.firstname,
            lastname: student.lastname,
            excludeStudentId: student._id,
        });
        student.username = username;
        await student.save();
        console.log(`Assigned username ${username} to ${student._id}`);
    }

    if (missingUsername.length === 0) {
        console.log('All students already have a username');
    }

    try {
        await Student.syncIndexes();
        console.log('Synced student indexes from schema');
    } catch (err) {
        console.warn('syncIndexes warning:', err.message);
    }

    await mongoose.disconnect();
    process.exit(0);
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
