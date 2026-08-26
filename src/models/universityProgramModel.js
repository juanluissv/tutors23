import mongoose from 'mongoose';

const UNIVERSITY_PROGRAM_TYPES = [
	'tecnico',
	'licenciatura',
	'ingenieria',
	'maestria',
	'doctorado',
	'diplomado',
];

const universityProgramSchema = mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	department: {
		type: String,
		required: false,
	},
	programType: {
		type: String,
		enum: UNIVERSITY_PROGRAM_TYPES,
		required: false,
	},
	school: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'School',
	},
}, {
	timestamps: true,
});

universityProgramSchema.index({ school: 1, name: 1 }, { unique: true });

const UniversityProgram = mongoose.model(
	'UniversityProgram',
	universityProgramSchema,
);

export default UniversityProgram;
export { UNIVERSITY_PROGRAM_TYPES };
