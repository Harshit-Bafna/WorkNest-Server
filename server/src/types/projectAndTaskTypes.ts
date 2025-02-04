import { EProjectPriority, EProjectStatus, EProjectTypes, ETaskPriority } from '../constants/Enums/projectAndTaskEnums'
import mongoose from 'mongoose'

export interface IProject {
    name: string
    description: string | null
    ownerId: mongoose.Schema.Types.ObjectId
    projectType: {
        pType: EProjectTypes
        otherType: string | null
    }
    projectDetails: {
        restricted: boolean
        managerId: mongoose.Schema.Types.ObjectId
    }
    logo: string | null
    teamMembers: mongoose.Schema.Types.ObjectId[]
    status: EProjectStatus
    priority: EProjectPriority
    startDate: Date
    endDate: Date | null
    progress: number
    attachments: {
        urls: string[]
        files: string[]
    }
}

export interface ITaskStatus {
    projectId: mongoose.Schema.Types.ObjectId
    statusDetails: {
        status: string
        position: number
    }
}

export interface ITask {
    title: string
    description: string | null
    assignedBy: mongoose.Schema.Types.ObjectId
    assignedTo: mongoose.Schema.Types.ObjectId | null
    projectId: mongoose.Schema.Types.ObjectId
    expiryTime: Date | null
    currentStatus: string | null
    startedAt: Date | null
    completedAt: Date | null
    priority: ETaskPriority
    attachments: {
        urls: string[]
        files: string[]
    }
}
