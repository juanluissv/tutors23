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
    grade: {
        type: Number,
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
    isCoursePublish: {
        type: Boolean,
        required: false
    },    
    dateCreated: {
        type: Date,
        required: false
    },  
    school: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'School'
    },  
    course:{
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Course'
    },     
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