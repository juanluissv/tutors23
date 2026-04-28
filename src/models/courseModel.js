import mongoose from 'mongoose';

const courseSchema = mongoose.Schema({       
    name: {
        type: String,
        required: true
    },
    isPublish: {
        type: Boolean,
        required: false
    }, 
    description: {
        type: String,
        required: true
    },      
    sections: [
        {
            sectionNumber: {
                type: String,
                required: false
            },
            sectionTitle: {
                type: String,
                required: false
            },
        }
    ],
    lessons: [
        {
            title: {
                type: String,
                required: false
            },  
            description: {
                type: String,
                required: false
            }, 
            section: {
                type: String,
                required: false
            },             
            mediaId: {
                type: String,
                required: false
            }, 
            lessonNumber: {
                type: String,
                required: false
            },   
            sectionNumber: {    
                type: String,
                required: false
            },         
        },
    ],
    teacher:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Teacher'
    },  
    subject:{
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Subject'
    },
    school:{
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'School'
    },
}, {
    timestamps: true
})




const Course = mongoose.model('Course', courseSchema);

export default Course;