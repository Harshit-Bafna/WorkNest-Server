import { EProjectPriority, EProjectStatus, EProjectTypes } from '../constants/Enums/projectEnums'
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
