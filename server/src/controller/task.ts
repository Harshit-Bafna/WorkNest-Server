import { CreateTaskDTO } from '../constants/DTO/Project and Task/CreateTaskDTO'
import userModel from '../model/user/userModel'
import taskModel from '../model/Projecs and tasks/taskModel'
import { CreateTaskStatusDTO } from '../constants/DTO/Project and Task/CreateTaskStatusDTO'
import taskStatusModel from '../model/Projecs and tasks/taskStatusModel'
import { ITask, ITaskStatus } from '../types/projectAndTaskTypes'
import mongoose from 'mongoose'
import { ApiMessage } from '../utils/ApiMessage'
import responseMessage from '../constants/responseMessage'

export const CreateNewTaskStatus = async (input: CreateTaskStatusDTO): Promise<ApiMessage> => {
    const { projectId, statusDetails } = input
    try {
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