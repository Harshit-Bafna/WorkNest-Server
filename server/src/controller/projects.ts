import mongoose from 'mongoose'
import { CreateProjectDTO } from '../constants/DTO/Project and Task/CreateProjectDTO'
import responseMessage from '../constants/responseMessage'
import { IProject, IProjectTeamMembers } from '../types/projectTypes'
import { ApiMessage } from '../utils/ApiMessage'
import { FindUserById } from '../utils/helper/asyncHelpers'
import projectModel from '../model/Projecs and tasks/projectModel'

export const CreateProject = async (input: CreateProjectDTO, userId: string): Promise<ApiMessage> => {
    const { name, description, projectType, logo, teamMembers, status, priority, attachments } = input

    try {
        const owner = await FindUserById(userId)
        if (!owner) {
            return {
                success: false,
                status: 404,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        }

        const teamMembersDetails: IProjectTeamMembers[] = []
        if (teamMembers && teamMembers.length > 0) {
            const memberResults = await Promise.all(
                teamMembers.map(async (member) => {
                    const isMember = await FindUserById(member.memberId)
                    if (!isMember) {
                        return {
                            success: false,
                            status: 404,
                            message: responseMessage.NOT_FOUND('Member'),
                            data: null
                        }
                    }

                    const memberDetail: IProjectTeamMembers = {
                        memberId: member.memberId as unknown as mongoose.Schema.Types.ObjectId,
                        role: ''
                    }
                    teamMembersDetails.push(memberDetail)
                    return null
                })
            )

            const failedMember = memberResults.find((result) => result !== null)
            if (failedMember) {
                return failedMember
            }
        }

        const projectPayload: IProject = {
            name: name,
            description: description ?? null,
            projectType: {
                pType: projectType.pType,
                otherType: projectType.otherType ?? null
            },
            logo: logo ?? null,
            ownerId: owner.id as mongoose.Schema.Types.ObjectId,
            teamMembers: teamMembersDetails,
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
