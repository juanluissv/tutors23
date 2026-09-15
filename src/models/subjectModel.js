import mongoose from 'mongoose';

const subjectSchema = mongoose.Schema({   
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },    
    teacherEmail: [
        {
        type: String,
        required: false
    },
    ],
    studentsEmail: [
        {
            type: String,
            required: false,
        },
    ],
    bookId: {
        type: String,
        required: false,
    },
    documents: [
        {
            fileId: {
                type: String,
                required: true,
            },
            fileName: {
                type: String,
                required: false,
            },
            label: {
                type: String,
                required: false,
            },
            uploadedAt: {
                type: Date,
                default: Date.now,
            },
            uploadedBy: {
                type: mongoose.Schema.Types.ObjectId,
                required: false,
                ref: 'SchoolAdmin',
            },
        },
    ],
    bookChapters: [
        {
            sourceDocumentId: {
                type: mongoose.Schema.Types.ObjectId,
                required: false,
            },
            ChapterNumber: {
                type: Number,
                required: false
            },
            ChapterTitle: {
                type: String,
                required: false
            },
            ChapterBeginPage: {
                type: Number,
                required: false
            },
            ChapterEndPage: {
                type: Number,
                required: false
            },
            ChapterFileId: {
                type: String,
                required: false,
            },
            ChapterTxtFileId: {
                type: String,
                required: false,
            },
            pineconeIndexName: {
                type: String,
                required: false,
            },
        }
    ],
    dateCreated: {
        type: Date,
        required: false
    },  
    school: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'School'
    },  
    gradesLevel: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'GradeLevel',
        },
    ],
    program: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'UniversityProgram',
        },
    ],
    semester: {
        type: Number,
        required: false,
        min: 1,
    },
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'Course'
        },
    ],     
    teachers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'Teacher'
        },
    ],  
    students: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'Student'
        },
    ],
    questions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'Question'
        },
    ],
    answers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'Answer'
        },
    ],
}, {
    timestamps: true
})




const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;