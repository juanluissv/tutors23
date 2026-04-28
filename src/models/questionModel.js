import mongoose from 'mongoose';

const questionSchema = mongoose.Schema({    
    tittle: {
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
    aiAnswer: {
        type: String,
        required: false
    }, 
    subjectname: {
        type: String,
        required: false
    },   
    studentname: {
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
}, {
    timestamps: true
})




const Question = mongoose.model('Question', questionSchema);

export default Question;