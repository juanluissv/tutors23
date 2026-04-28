import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const schoolAdminSchema = mongoose.Schema({    
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
        default: 'admin'
    },    
    jobtitle: {
        type: String,
        required: false
    },
    about: {
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
    
}, {
    timestamps: true
})

schoolAdminSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

schoolAdminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next()
    }

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

const SchoolAdmin = mongoose.model('SchoolAdmin', schoolAdminSchema);

export default SchoolAdmin;