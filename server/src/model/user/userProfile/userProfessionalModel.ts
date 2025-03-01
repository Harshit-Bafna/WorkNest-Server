import mongoose from 'mongoose'
import { IUserProfession } from '../../../types/userTypes'

const userProfessionSchema = new mongoose.Schema<IUserProfession>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        organizationName: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true
        },
        position: {
            type: String,
            required: true
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

export default mongoose.model<IUserProfession>('userProfession', userProfessionSchema)
