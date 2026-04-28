import mongoose from 'mongoose';

const planSchema = mongoose.Schema({    
    price: {
        type: Number,
        required: true
    },
    teacherName: {
        type: String,
        required: false
    },
    subjectName: {
        type: String,
        required: false
    },
    totalQuestions: {
        type: Number,
        required: true
    },  
    active: {
        type: Boolean,
        required: false
    }, 
    deactive: {
        type: Boolean,
        required: false
    }, 
    school:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'School'
    },
    teacher:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Teacher'
    },
    subject:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Subject'
    },
    students: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'Student'
        },
    ],       
}, {
    timestamps: true
})




const Plan = mongoose.model('Plan', planSchema);

export default Plan;