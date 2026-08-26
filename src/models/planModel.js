import mongoose from 'mongoose';

const planSemesterSchema = mongoose.Schema({
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
}, { _id: false })

const planSchema = mongoose.Schema({    
    price: {
        type: Number,
        required: true
    },        
    totalQuestions: {
        type: Number,
        required: true
    },      
    active: {
        type: Boolean,
        required: false
    },    
    gradesLevel: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'GradeLevel',
        },
    program: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'UniversityProgram',
    },
    maxSubjects: {
        type: Number,
        required: false,
        min: 1,
        default: 5,
    },
    semesters: {
        type: [planSemesterSchema],
        required: false,
        default: [],
    },
    subjects: [
        {
        type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'Subject'
        },
    ],  
    students: [
        {
        type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'Student'
        },
    ],   
    school: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'School'
    },      
}, {
    timestamps: true
})




const Plan = mongoose.model('Plan', planSchema);

export default Plan;