import ApiError from '../utils/ApiError'
import ApiResponse from '../utils/ApiResponse'
import { Router, Request, Response, NextFunction } from 'express'
import { validateDTO } from '../utils/validateDto'
import DtoError from '../utils/DtoError'
import rateLimit from '../middleware/rateLimit'
import { CreateProjectDTO } from '../constants/DTO/Project/CreateProjectDTO'
import { CreateProject } from '../controller/projects'
import responseMessage from '../constants/responseMessage'
import { VerifyToken } from '../utils/helper/syncHelpers'
import config from '../config/config'
import { IDecryptedJwt } from '../types/userTypes'
const router = Router()

/*
    Route: /api/v1/project/create
    Method: POST
    Desc: Create a new project
    Access: Protected
    Body: CreateProjectDTO
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
        const requestValidation = await validateDTO(CreateProjectDTO, body)
        if (!requestValidation.success) {
            return DtoError(next, req, requestValidation.status, requestValidation.errors)
        }

        const createProject = await CreateProject(req.body as CreateProjectDTO, userId)
        if (!createProject.success) {
            return ApiError(next, null, req, createProject.status, createProject.message)
        }
        return ApiResponse(req, res, createProject.status, createProject.message, createProject.data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

export default router
