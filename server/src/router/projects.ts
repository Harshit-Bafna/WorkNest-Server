import ApiError from '../utils/ApiError'
import ApiResponse from '../utils/ApiResponse'
import { Router, Request, Response, NextFunction } from 'express'
import { validateDTO } from '../utils/validateDto'
import DtoError from '../utils/DtoError'
import rateLimit from '../middleware/rateLimit'
import { CreateProjectDTO } from '../constants/DTO/Project and Task/CreateProjectDTO'
import { AddMembersInProject, CreateProject, GetAllProjects, GetProjectDetails } from '../controller/projects'
import responseMessage from '../constants/responseMessage'
import { VerifyToken } from '../utils/helper/syncHelpers'
import config from '../config/config'
import { IDecryptedJwt } from '../types/userTypes'
import { ProjectMemberManagementDTO } from '../constants/DTO/Project and Task/ProjectMemberManagementDTO'
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

/*
    Route: /api/v1/project/getAll
    Method: GET
    Desc: Get all project
    Access: Protected
*/
router.get('/getAll', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { accessToken } = cookies as { accessToken: string | undefined }
        if (!accessToken) {
            return ApiError(next, null, req, 400, responseMessage.UNAUTHORIZED)
        }
        const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt

        const page: number = req.query.page ? Number(req.query.page as unknown) : 1
        if (page <= 0) {
            return ApiError(next, null, req, 400, responseMessage.INVALID_VALUE('page number'))
        }

        const limit: number = Number(req.query.limit as unknown) | 10
        if (limit <= 0) {
            return ApiError(next, null, req, 400, responseMessage.INVALID_VALUE('page limit'))
        }

        const search: string = req.query.search as string

        const { success, status, message, data } = await GetAllProjects(userId, page, limit, search)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/project/get/:projectId
    Method: GET
    Desc:  Get project details
    Access: Protected
*/
router.get('/get/:projectId', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { accessToken } = cookies as { accessToken: string | undefined }
        if (!accessToken) {
            return ApiError(next, null, req, 400, responseMessage.UNAUTHORIZED)
        }
        const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt

        const projectId: string = req.params.projectId
        
        const { success, status, message, data } = await GetProjectDetails(projectId, userId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/project/addMembers
    Method: PUT
    Desc:  Add members in project
    Access: Protected
    Body: ProjectMemberManagementDTO
*/
router.put('/addMembers', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { accessToken } = cookies as { accessToken: string | undefined }
        if (!accessToken) {
            return ApiError(next, null, req, 400, responseMessage.UNAUTHORIZED)
        }
        const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt

        const body: object = req.body as object
        const requestValidation = await validateDTO(ProjectMemberManagementDTO, body)
        if (!requestValidation.success) {
            return DtoError(next, req, requestValidation.status, requestValidation.errors)
        }
        
        const { success, status, message, data } = await AddMembersInProject(req.body as ProjectMemberManagementDTO, userId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/project/removeMembers
    Method: PUT
    Desc:  Remove members from project
    Access: Protected
    Body: ProjectMemberManagementDTO
*/
router.put('/removeMembers', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { accessToken } = cookies as { accessToken: string | undefined }
        if (!accessToken) {
            return ApiError(next, null, req, 400, responseMessage.UNAUTHORIZED)
        }
        const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt

        const body: object = req.body as object
        const requestValidation = await validateDTO(ProjectMemberManagementDTO, body)
        if (!requestValidation.success) {
            return DtoError(next, req, requestValidation.status, requestValidation.errors)
        }
        
        const { success, status, message, data } = await AddMembersInProject(req.body as ProjectMemberManagementDTO, userId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

export default router
