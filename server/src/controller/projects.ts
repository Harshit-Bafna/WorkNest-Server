import mongoose from 'mongoose'
import { CreateProjectDTO } from '../constants/DTO/Project and Task/CreateProjectDTO'
import responseMessage from '../constants/responseMessage'
import { IProject } from '../types/projectAndTaskTypes'
import { ApiMessage } from '../utils/ApiMessage'
import projectModel from '../model/Projecs and tasks/projectModel'
import userModel from '../model/user/userModel'
import { EUserRole } from '../constants/Enums/applicationEnums'

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


