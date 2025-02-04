import mongoose from 'mongoose'
import { ITaskStatus } from '../../types/projectAndTaskTypes'

const taskStatusSchema = new mongoose.Schema<ITaskStatus>(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'project',
            required: true
        },
        statusDetails: {
            _id: false,
            status: {
                type: String,
                required: true
            },
            files: {
                type: Number,
                required: true
            }
        }
    },
    { timestamps: true }
)

export default mongoose.model<ITaskStatus>('taskStatus', taskStatusSchema)
