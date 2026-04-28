import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const teacherSchema = mongoose.Schema({
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
        default: 'teacher'
    },
    image: {
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
        ref: 'School',
    },
    subjects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Subject'
        },
    ],
    courses:[
        {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Course'
        },  
    ],  
    questions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Question'
        },
    ],
    answers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Answer'
        },
    ],
               
}, {
    timestamps: true
})

teacherSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

teacherSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next()
    }

    const salt = await bcrypt.genSalt(10)
    this.password  = await bcrypt.hash(this.password, salt)
})

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher;