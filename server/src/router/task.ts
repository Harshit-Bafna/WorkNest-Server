import ApiError from '../utils/ApiError'
import ApiResponse from '../utils/ApiResponse'
import { Router, Request, Response, NextFunction } from 'express'
import { validateDTO } from '../utils/validateDto'
import DtoError from '../utils/DtoError'
import rateLimit from '../middleware/rateLimit'
import responseMessage from '../constants/responseMessage'
import { VerifyToken } from '../utils/helper/syncHelpers'
import config from '../config/config'
import { IDecryptedJwt } from '../types/userTypes'
import { CreateTaskDTO } from '../constants/DTO/Project and Task/CreateTaskDTO'
import { CreateNewTaskStatus, CreateTask } from '../controller/task'
import { CreateTaskStatusDTO } from '../constants/DTO/Project and Task/CreateTaskStatusDTO'
const router = Router()

/*
    Route: /api/v1/task/status/create
    Method: POST
    Desc: Create a new task status
    Access: Protected
    Body: CreateTaskDTO
*/
router.post('/status/create', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body: object = req.body as object
        const requestValidation = await validateDTO(CreateTaskStatusDTO, body)
        if (!requestValidation.success) {
            return DtoError(next, req, requestValidation.status, requestValidation.errors)
        }

        const { success, status, message, data } = await CreateNewTaskStatus(req.body as CreateTaskStatusDTO)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/task/create
    Method: POST
    Desc: Create a new task
    Access: Protected
    Body: CreateTaskDTO
*/
router.post('/create', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { accessToken } = cookies as { accessToken: string | undefined }
        if (!accessToken) {
            return ApiError(next, null, req, 400, responseMessage.UNAUTHORIZED)
        }
        const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt

        const body: object = req.body as object
        const requestValidation = await validateDTO(CreateTaskDTO, body)
        if (!requestValidation.success) {
            return DtoError(next, req, requestValidation.status, requestValidation.errors)
        }

        const { success, status, message, data } = await CreateTask(req.body as CreateTaskDTO, userId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

export default router
