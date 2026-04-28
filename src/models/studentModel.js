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
    zipcode: {
        type: String,
        required: false
    },    
    signInDate: {
        type: Date,
        required: false
    },        
    status: {
        type: String,
        required: false
    },  
    stripe_customer_id: {
        type: String,
        required: false
    },
    stripeSession: {},
    school: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'School'
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Plan'
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
            required: true,
            ref: 'Subject'
        },
    ],

    numberOfQuestion: [

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
                type: String,
                required: false
            },
            subProcessing: {
                type: Boolean,
                required: false
            },
            endDate: {
                type: String,
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
            stripe_subscription_id: { type: String, required: false },


        },
    ],
}, {
    timestamps: true
})

studentSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

studentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next()
    }

    const salt = await bcrypt.genSalt(10)
    this.password  = await bcrypt.hash(this.password, salt)
})

const Student = mongoose.model('Student', studentSchema);

export default Student;