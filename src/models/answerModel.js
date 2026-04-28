import mongoose from 'mongoose';

const answerSchema = mongoose.Schema({    
    title: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },  
    subjectname: {
        type: String,
        required: false
    },   
    mediaId: {
        type: String,
        required: false,
    },
    playlist: {
        type: String,
        required: false,
    },
    isWatched: {
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
    question:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Question'
    },       
}, {
    timestamps: true
})




const Answer = mongoose.model('Answer', answerSchema);

export default Answer;