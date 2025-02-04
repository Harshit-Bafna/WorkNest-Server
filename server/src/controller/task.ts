import { CreateTaskDTO } from '../constants/DTO/Project and Task/CreateTaskDTO'
import userModel from '../model/user/userModel'
import taskModel from '../model/Projecs and tasks/taskModel'
import { CreateTaskStatusDTO } from '../constants/DTO/Project and Task/CreateTaskStatusDTO'
import taskStatusModel from '../model/Projecs and tasks/taskStatusModel'
import { ITask, ITaskStatus } from '../types/projectAndTaskTypes'
import mongoose from 'mongoose'
import { ApiMessage } from '../utils/ApiMessage'
import responseMessage from '../constants/responseMessage'
import projectModel from '../model/Projecs and tasks/projectModel'

export const CreateNewTaskStatus = async (input: CreateTaskStatusDTO, userId: string): Promise<ApiMessage> => {
    const { projectId, statusDetails } = input
    try {
        const project = await projectModel.findById(projectId)
        if (!project) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('Project'),
                data: null
            }
        }

        if (project.projectDetails.restricted) {
            if (project.projectDetails.managerId !== (userId as unknown) || project.ownerId !== (userId as unknown)) {
                return {
                    success: false,
                    status: 404,
                    message: responseMessage.UNAUTHORIZED,
                    data: null
                }
            }
        } else {
            const isMember = project.teamMembers.some((member) => member.memberId === (userId as unknown))

            if (!isMember || project.projectDetails.managerId !== (userId as unknown) || project.ownerId !== (userId as unknown)) {
                return {
                    success: false,
                    status: 404,
                    message: responseMessage.UNAUTHORIZED,
                    data: null
                }
            }
        }

        const payload: ITaskStatus = {
            projectId: projectId as unknown as mongoose.Schema.Types.ObjectId,
            statusDetails: {
                status: statusDetails.status,
                position: statusDetails.position
            }
        }

        const newTaskStatus = await taskStatusModel.create(payload)

        return {
            success: true,
            status: 201,
            message: responseMessage.SUCCESS,
            data: {
                newTaskStatus: newTaskStatus
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

export const CreateTask = async (input: CreateTaskDTO, userId: string): Promise<ApiMessage> => {
    const { title, description, assignedTo, projectId, expiryTime, priority, attachments } = input
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

        const project = await projectModel.findById(projectId)
        if (!project) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('Project'),
                data: null
            }
        }

        if (project.projectDetails.restricted) {
            if (project.projectDetails.managerId !== (userId as unknown) || project.ownerId !== (userId as unknown)) {
                return {
                    success: false,
                    status: 404,
                    message: responseMessage.UNAUTHORIZED,
                    data: null
                }
            }
        } else {
            const isMember = project.teamMembers.some((member) => member.memberId === (userId as unknown))

            if (!isMember || project.projectDetails.managerId !== (userId as unknown) || project.ownerId !== (userId as unknown)) {
                return {
                    success: false,
                    status: 404,
                    message: responseMessage.UNAUTHORIZED,
                    data: null
                }
            }
        }

        const payload: ITask = {
            title: title,
            description: description ?? null,
            assignedBy: user.id as mongoose.Schema.Types.ObjectId,
            assignedTo: assignedTo ? (assignedTo as unknown as mongoose.Schema.Types.ObjectId) : null,
            projectId: projectId as unknown as mongoose.Schema.Types.ObjectId,
            expiryTime: expiryTime ?? null,
            startedAt: null,
            currentStatus: '',
            completedAt: null,
            priority: priority,
            attachments: {
                urls: attachments?.urls ?? [],
                files: attachments?.files ?? []
            }
        }

        const newTask = await taskModel.create(payload)

        return {
            success: false,
            status: 201,
            message: responseMessage.SUCCESS,
            data: {
                newTask: newTask
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
