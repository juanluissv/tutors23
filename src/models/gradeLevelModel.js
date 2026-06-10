import mongoose from 'mongoose';

const gradeLevelSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'School',
    },
}, {
    timestamps: true,
});

gradeLevelSchema.index({ school: 1, name: 1 }, { unique: true });

const GradeLevel = mongoose.model('GradeLevel', gradeLevelSchema);

export default GradeLevel;
