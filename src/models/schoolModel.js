import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const schoolSchema = mongoose.Schema({    
    name: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: false
    },
    address: {
        type: String,
        required: false
    },
    signInDate: {
        type: Date,
        required: false
    },    
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'SchoolAdmin'
    },
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
    students: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'Student'
        },
    ],
    plans: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'Plan'
        },
    ],
               
}, {
    timestamps: true
})


const School = mongoose.model('School', schoolSchema);

export default School;