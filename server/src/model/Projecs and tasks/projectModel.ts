import mongoose from 'mongoose'
import { IProject } from '../../types/projectAndTaskTypes'
import { EProjectPriority, EProjectStatus, EProjectTypes } from '../../constants/Enums/projectAndTaskEnums'

const projectSchema = new mongoose.Schema<IProject>(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: false
        },
        projectType: {
            _id: false,
            pType: {
                type: String,
                enum: Object.values(EProjectTypes),
                required: true
            },
            otherType: {
                type: String,
                required: false
            }
        },
        logo: {
            type: String,
            required: false
        },
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        teamMembers: [{
            _id: false,
            memberId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user',
                required: true
            },
            role: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user',
                required: true
            }
        }],
        status: {
            type: String,
            enum: Object.values(EProjectStatus),
            required: true
        },
        priority: {
            type: String,
            enum: Object.values(EProjectPriority),
            required: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: false
        },
        progress: {
            type: Number,
            default: 0,
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

export default mongoose.model<IProject>('project', projectSchema)
