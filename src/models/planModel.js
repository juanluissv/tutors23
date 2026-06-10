import mongoose from 'mongoose';

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