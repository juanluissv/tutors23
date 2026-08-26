import mongoose from 'mongoose';

const subscriptionSemesterSchema = mongoose.Schema({
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
}, { _id: false })

const semesterSelectionSchema = mongoose.Schema({
    semesterIndex: {
        type: Number,
        required: true,
        min: 0,
    },
    selectedSubjects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'Subject',
        },
    ],
    subjectsSelectedAt: {
        type: Date,
        required: false,
    },
}, { _id: false })

const subscriptionSchema = mongoose.Schema({    
    startDate: {
        type: Date,
        required: false
    },
    endDate: {
        type: Date,
        required: false
    },
    endOfSemesterDate: {
        type: Date,
        required: false,
    },
    semesters: {
        type: [subscriptionSemesterSchema],
        required: false,
        default: [],
    },
    currentSemesterIndex: {
        type: Number,
        required: false,
        min: 0,
        default: 0,
    },
    questionsAsked: { 
        type: Number, required: false 
    },
    questionsLeft: { 
        type: Number, 
        required: false 
    },
    totalQuestions: { 
        type: Number, 
        required: false 
    },
    active: { 
        type: Boolean, 
        required: false 
    },
    renewal: { 
        type: Boolean,
         required: false 
        },
    pastDue: { 
        type: Boolean, 
        required: false 
    },          
    plan:{
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Plan'
    },
    selectedSubjects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'Subject',
        },
    ],
    subjectsSelectedAt: {
        type: Date,
        required: false,
    },
    semesterSelections: {
        type: [semesterSelectionSchema],
        required: false,
        default: [],
    },
    amountPaid: {
        type: Number,
        required: false,
    },
}, {
    timestamps: true
})




const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;