import mongoose from 'mongoose'
import { IUserEducation } from '../../../types/userTypes'
import { EGradeType } from '../../../constants/Enums/applicationEnums'

const userEducationSchema = new mongoose.Schema<IUserEducation>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        institutionName: {
            type: String,
            required: true
        },
        degree: {
            type: String,
            required: true
        },
        grade: {
            _id: false,
            type: {
                type: String,
                enum: Object.values(EGradeType),
                required: true
            },
            value: {
                type: Number,
                required: true
            }
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            default: null
        },
        isPresent: {
            type: Boolean,
            required: true
        }
    },
    { timestamps: true }
)

export default mongoose.model<IUserEducation>('userEducation', userEducationSchema)
