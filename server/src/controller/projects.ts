import mongoose from 'mongoose'
import { CreateProjectDTO } from '../constants/DTO/Project and Task/CreateProjectDTO'
import responseMessage from '../constants/responseMessage'
import { IProject } from '../types/projectAndTaskTypes'
import { ApiMessage } from '../utils/ApiMessage'
import projectModel from '../model/Projecs and tasks/projectModel'
import userModel from '../model/user/userModel'
import { EUserRole } from '../constants/Enums/applicationEnums'
import { EProjectTypes } from '../constants/Enums/projectAndTaskEnums'
import { ProjectMemberManagementDTO } from '../constants/DTO/Project and Task/ProjectMemberManagementDTO'

export const CreateProject = async (input: CreateProjectDTO, userId: string): Promise<ApiMessage> => {
    const { name, description, projectType, logo, teamMemberIds, status, priority, attachments, projectDetails } = input
    const teamMembers: mongoose.Schema.Types.ObjectId[] = []

    try {
        const owner = await userModel.findById(userId)
        if (!owner) {
            return {
                success: false,
                status: 404,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        }

        const existingProject = await projectModel.findOne({
            name: name,
            ownerId: userId
        })
        if (existingProject) {
            return {
                success: false,
                status: 400,
                message: responseMessage.ALREADY_IN_USE('Project name'),
                data: null
            }
        }

        const manager = await userModel.findById(projectDetails.managerId)
        if (!manager) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('Manager'),
                data: null
            }
        }

        if (owner.organisation.isAssociated) {
            if (owner.role !== EUserRole.ORGANISATION_ADMIN) {
                return {
                    success: false,
                    status: 404,
                    message: responseMessage.UNAUTHORIZED,
                    data: null
                }
            }

            if (
                !(owner.organisation.organisationId instanceof mongoose.Types.ObjectId) ||
                !(manager.organisation.organisationId instanceof mongoose.Types.ObjectId) ||
                !owner.organisation.organisationId.equals(manager.organisation.organisationId)
            ) {
                return {
                    success: false,
                    status: 404,
                    message: responseMessage.INVALID_REQUEST,
                    data: null
                }
            }

            if (teamMemberIds && teamMemberIds.length > 0) {
                const memberResults = await Promise.all(
                    teamMemberIds.map(async (memberId) => {
                        const isMember = await userModel.findById(memberId)
                        if (!isMember) {
                            return {
                                success: false,
                                status: 404,
                                message: responseMessage.NOT_FOUND('Member'),
                                data: null
                            }
                        }

                        if (
                            !(isMember.organisation.organisationId instanceof mongoose.Types.ObjectId) ||
                            !(owner.organisation.organisationId instanceof mongoose.Types.ObjectId) ||
                            !isMember.organisation.organisationId.equals(owner.organisation.organisationId)
                        ) {
                            return {
                                success: false,
                                status: 404,
                                message: responseMessage.INVALID_REQUEST,
                                data: null
                            }
                        }

                        teamMembers.push(memberId as unknown as mongoose.Schema.Types.ObjectId)
                        return null
                    })
                )

                const failedMember = memberResults.find((result) => result !== null)
                if (failedMember) {
                    return failedMember
                }
            }
        } else {
            projectDetails.managerId = owner.id as string
        }

        const projectPayload: IProject = {
            name: name,
            description: description ?? null,
            projectType: {
                pType: projectType.pType,
                otherType: projectType.otherType ?? null
            },
            projectDetails: {
                restricted: projectDetails.restricted,
                managerId: projectDetails.managerId as unknown as mongoose.Schema.Types.ObjectId
            },
            logo: logo ?? null,
            ownerId: owner.id as mongoose.Schema.Types.ObjectId,
            teamMembers: teamMembers,
            status: status,
            priority: priority,
            startDate: new Date(),
            endDate: null,
            progress: 0,
            attachments: {
                urls: attachments?.urls ?? [],
                files: attachments?.files ?? []
            }
        }

        const newProject = await projectModel.create(projectPayload)

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                projectDetails: newProject
            }
        }
    } catch (error) {
        const errMessage = error instanceof Error ? error.message : responseMessage.SOMETHING_WENT_WRONG
        return {
            success: false,
            status: 500,
            message: errMessage,
            data: null
        }
    }
}

export const GetAllProjects = async (userId: string, page: number, limit: number, search: string | null): Promise<ApiMessage> => {
    const skip = (page - 1) * limit
    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        }

        const roleBasedQueries: Record<string, object> = {
            [EUserRole.ORGANISATION_ADMIN]: { ownerId: userId },
            [EUserRole.USER]: { ownerId: userId },
            [EUserRole.ORGANISATION_MANAGER]: { 'projectDetails.managerId': userId },
            [EUserRole.ORGANISATION_USER]: { teamMembers: userId }
        }

        const query = roleBasedQueries[user.role] || null
        if (!query) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        }

        if (search) {
            Object.assign(query, {
                $or: [{ name: { $regex: search, $options: 'i' } }, { emailAddress: { $regex: search, $options: 'i' } }]
            })
        }

        const projects = await projectModel
            .find(query)
            .select('name projectType projectDetails logo ownerId teamMembers status priority startDate endDate progress')
            .lean()
            .skip(skip)
            .limit(limit)

        const totalCount = await projectModel.countDocuments(query)

        const responsePayload = projects.map((project) => ({
            projectName: project.name,
            projectType: project.projectType.pType === EProjectTypes.OTHER ? project.projectType.otherType : project.projectType.pType,
            isRestricted: project.projectDetails.restricted,
            logo: project.logo,
            status: project.status,
            priority: project.priority,
            startDate: project.startDate,
            endDate: project.endDate,
            progress: project.progress
        }))

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                projects: responsePayload,
                totalCount: totalCount,
                page,
                limit
            }
        }
    } catch (error) {
        const errMessage = error instanceof Error ? error.message : responseMessage.SOMETHING_WENT_WRONG
        return {
            success: false,
            status: 500,
            message: errMessage,
            data: null
        }
    }
}

export const GetProjectDetails = async (projectId: string, userId: string): Promise<ApiMessage> => {
    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        }

        const project = await projectModel
            .findById(projectId)
            .select('name projectType projectDetails ownerId teamMembers logo status priority startDate endDate progress')

        if (!project) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('Project'),
                data: null
            }
        }

        if (
            user.id != project.ownerId &&
            user.id != project.projectDetails.managerId &&
            !project.teamMembers.includes(user.id as unknown as mongoose.Schema.Types.ObjectId)
        ) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        }

        const owner = await userModel.findById(project.ownerId).select('id name emailAddress organisation')
        if (!owner) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('Project owner'),
                data: null
            }
        }

        let response = null
        let manager = null
        let teamMembers = null

        if (owner.organisation.isAssociated) {
            manager = await userModel.findById(project.projectDetails.managerId).select('id name emailAddress')
            if (!manager) {
                return {
                    success: false,
                    status: 404,
                    message: responseMessage.NOT_FOUND('Project manager'),
                    data: null
                }
            }

            if (project.teamMembers) {
                teamMembers = await userModel
                    .find({
                        _id: { $in: project.teamMembers }
                    })
                    .limit(3)
                    .select('id name emailAddress')
            }
        }

        const projectDetail = {
            projectName: project.name,
            projectType: project.projectType.pType === EProjectTypes.OTHER ? project.projectType.otherType : project.projectType.pType,
            isRestricted: project.projectDetails.restricted,
            logo: project.logo,
            status: project.status,
            priority: project.priority,
            startDate: project.startDate,
            endDate: project.endDate,
            progress: project.progress
        }

        if (manager && teamMembers) {
            response = {
                projectDetail: projectDetail,
                owner: owner,
                manager: manager,
                teamMembers: teamMembers
            }
        } else if (manager && !teamMembers) {
            response = {
                projectDetail: projectDetail,
                owner: owner,
                manager: manager
            }
        } else {
            response = {
                projectDetail: projectDetail,
                owner: owner
            }
        }

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: response
        }
    } catch (error) {
        const errMessage = error instanceof Error ? error.message : responseMessage.SOMETHING_WENT_WRONG
        return {
            success: false,
            status: 500,
            message: errMessage,
            data: null
        }
    }
}

export const AddMembersInProject = async (input: ProjectMemberManagementDTO, userId: string): Promise<ApiMessage> => {
    const { projectId, teamMemberIds } = input

    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        }

        if (!user.organisation.isAssociated) {
            return {
                success: false,
                status: 400,
                message: responseMessage.INVALID_REQUEST,
                data: null
            }
        }

        const project = await projectModel.findById(projectId)
        if (!project) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('Project'),
                data: null
            }
        }

        if (project.ownerId != user.id && project.projectDetails.managerId != user.id) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED + 'dghf',
                data: null
            }
        }

        if (teamMemberIds && teamMemberIds.length > 0) {
            await Promise.all(
                teamMemberIds.map(async (memberId) => {
                    if (project.teamMembers.includes(memberId as unknown as mongoose.Schema.Types.ObjectId)) {
                        return {
                            success: false,
                            status: 401,
                            message: responseMessage.INVALID_REQUEST,
                            data: null
                        }
                    }

                    const newMember = await userModel.findById(memberId)
                    if (!newMember) {
                        return {
                            success: false,
                            status: 401,
                            message: responseMessage.NOT_FOUND('Member'),
                            data: null
                        }
                    }

                    if (!(newMember.role === EUserRole.ORGANISATION_USER)) {
                        return {
                            success: false,
                            status: 401,
                            message: responseMessage.INVALID_REQUEST,
                            data: null
                        }
                    }

                    return null
                })
            )
        }

        teamMemberIds.map((memberId) => {
            project.teamMembers.push(memberId as unknown as mongoose.Schema.Types.ObjectId)
        })

        await project.save()

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                project: project
            }
        }
    } catch (error) {
        const errMessage = error instanceof Error ? error.message : responseMessage.SOMETHING_WENT_WRONG
        return {
            success: false,
            status: 500,
            message: errMessage,
            data: null
        }
    }
}

export const RemoveMembersFromProject = async (input: ProjectMemberManagementDTO, userId: string): Promise<ApiMessage> => {
    const { projectId, teamMemberIds } = input
    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        }

        if (!user.organisation.isAssociated) {
            return {
                success: false,
                status: 400,
                message: responseMessage.INVALID_REQUEST,
                data: null
            }
        }

        const project = await projectModel.findById(projectId)
        if (!project) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('Project'),
                data: null
            }
        }

        if (project.ownerId != user.id && project.projectDetails.managerId != user.id) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED + 'dghf',
                data: null
            }
        }

        if (teamMemberIds && teamMemberIds.length > 0) {
            teamMemberIds.map((memberId) => {
                if (!project.teamMembers.includes(memberId as unknown as mongoose.Schema.Types.ObjectId)) {
                    return {
                        success: false,
                        status: 401,
                        message: responseMessage.INVALID_REQUEST,
                        data: null
                    }
                }
                return null
            })
        }

        project.teamMembers = project.teamMembers.filter((memberId) => !teamMemberIds.includes(memberId as unknown as string))

        await project.save()

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                project: project
            }
        }
    } catch (error) {
        const errMessage = error instanceof Error ? error.message : responseMessage.SOMETHING_WENT_WRONG
        return {
            success: false,
            status: 500,
            message: errMessage,
            data: null
        }
    }
}
