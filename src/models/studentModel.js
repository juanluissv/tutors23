import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const studentSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        default: 'student'
    },
    birthDate: {
        type: Date,
        required: false
    },
    country: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: false
    },     
    signInDate: {
        type: Date,
        required: false
    },        
    school: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'School'
    },    
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'Course'
        },        
    ],  
    subjects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'Subject'
        },
    ],
    subscriptions: [
        {
            plan: {
                type: mongoose.Schema.Types.ObjectId,
                required: false,
                ref: 'Plan',
            },
            subject:{
                type: mongoose.Schema.Types.ObjectId,
                required: false,
                ref: 'Subject'
            },
            startDate: {
                type: Date,
                required: false
            },
            subProcessing: {
                type: Boolean,
                required: false
            },
            endDate: {
                type: Date,
                required: false
            },
            name: {
                type: String,
                required: false
            },            
            questionsAsked: { type: Number, required: false },
            questionsLeft: { type: Number, required: false },
            totalQuestions: { type: Number, required: false },
            planTotalQuestions: { type: Number, required: false },
            active: { type: Boolean, required: false },
            renewal: { type: Boolean, required: false },
            pastDue: { type: Boolean, required: false },
        },
    ],
}, {
    timestamps: true
})

studentSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

studentSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return
    }

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

const Student = mongoose.model('Student', studentSchema);

export default Student;