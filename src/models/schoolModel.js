import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const schoolSchema = mongoose.Schema({    
    name: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: false
    },
    signInDate: {
        type: Date,
        required: false
    },       
    schoolType: {
        type: String,
        enum: ['high school', 'university'],
        required: true
    },    
    gradesLevels: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'GradeLevel',
        },
    ],
    subjects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'Subject'
        },
    ],
    teachers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'Teacher'
        },
    ],
    plans: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'Plan'
        },
    ],
    students: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'Student'
        },
    ],    
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'SchoolAdmin'
    },
    subscriptions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'Subscription'
        },
    ],
               
}, {
    timestamps: true
})


const School = mongoose.model('School', schoolSchema);

export default School;