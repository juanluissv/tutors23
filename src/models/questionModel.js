import mongoose from 'mongoose';

const questionSchema = mongoose.Schema({    
    title: {
        type: String,
        required: true
    },   
    description: {
        type: String,
        required: false
    }, 
    aiAnswer: {
        type: String,
        required: false
    },   
    mediaId: {
        type: String,
        required: false,
    },
    isAnswer: {
        type: Boolean,
        required: false,
    },
    dateCreated: {
        type: Date,
        required: false
    },  
    teacher:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Teacher'
    },
    student:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Student'
    }, 
    subject:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Subject'
    }, 
    answer:{
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            ref: 'Answer'
        },
}, {
    timestamps: true
})




const Question = mongoose.model('Question', questionSchema);

export default Question;