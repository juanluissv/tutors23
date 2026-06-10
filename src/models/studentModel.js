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
        required: false,
        unique: false,
        sparse: true,
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false
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
    gradesLevel: 
        {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'GradeLevel',
        },
    subjects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'Subject'
        },
    ],
    plans: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'Plan'
        },
    ],
    subscriptions: [        
             {
                type: mongoose.Schema.Types.ObjectId,
                required: false,
                ref: 'Subscription',
            }                              
    ],
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'Course'
        },        
    ],
    questions: [        
        {
           type: mongoose.Schema.Types.ObjectId,
           required: false,
           ref: 'Question', 
       }                              
    ],
    answers: [        
        {
           type: mongoose.Schema.Types.ObjectId,
           required: false,
           ref: 'Answer', 
       }                              
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