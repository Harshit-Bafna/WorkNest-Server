import mongoose from 'mongoose'
import { ITask } from '../../types/projectAndTaskTypes'
import { ETaskPriority } from '../../constants/Enums/projectAndTaskEnums'

const taskSchema = new mongoose.Schema<ITask>(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: false
        },
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: false
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'project',
            required: true
        },
        expiryTime: {
            type: Date,
            required: false
        },
        startedAt: {
            type: Date,
            required: false
        },
        completedAt: {
            type: Date,
            required: false
        },
        priority: {
            type: String,
            enum: Object.values(ETaskPriority),
            required: true
        },
        attachments: {
            _id: false,
            urls: {
                type: [String],
                required: false
            },
            files: {
                type: [String],
                required: false
            }
        }
    },
    { timestamps: true }
)

export default mongoose.model<ITask>('task', taskSchema)
