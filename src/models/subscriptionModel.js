import mongoose from 'mongoose';

const subscriptionSchema = mongoose.Schema({    
    startDate: {
        type: Date,
        required: false
    },
    endDate: {
        type: Date,
        required: false
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
    amountPaid: {
        type: Number,
        required: false,
    },
}, {
    timestamps: true
})




const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;