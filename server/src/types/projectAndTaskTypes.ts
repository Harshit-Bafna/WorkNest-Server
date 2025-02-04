import { EProjectPriority, EProjectStatus, EProjectTypes, ETaskPriority } from '../constants/Enums/projectAndTaskEnums'
import mongoose from 'mongoose'

export interface IProjectTeamMembers {
    memberId: mongoose.Schema.Types.ObjectId
    role: string
}

export interface IProject {
    name: string
    description: string | null
    projectType: {
        pType: EProjectTypes
        otherType: string | null
    }
    logo: string | null
    ownerId: mongoose.Schema.Types.ObjectId | null
    teamMembers: IProjectTeamMembers[]
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
