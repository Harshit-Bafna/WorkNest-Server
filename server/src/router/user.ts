import ApiError from '../utils/ApiError'
import ApiResponse from '../utils/ApiResponse'
import { Router, Request, Response, NextFunction } from 'express'
import rateLimit from '../middleware/rateLimit'
import responseMessage from '../constants/responseMessage'
import { VerifyToken } from '../utils/helper/syncHelpers'
import config from '../config/config'
import { IDecryptedJwt } from '../types/userTypes'
import {
    CreateUserEducation,
    CreateUserProfession,
    DeleteUserEducation,
    DeleteUserProfession,
    GetAllUser,
    GetAllUserEducation,
    GetAllUserProfession,
    GetUserDetails,
    UpdateBasicInfo,
    UpdateUserEducation,
    UpdateUserProfession
} from '../controller/user'
import { validateDTO } from '../utils/validateDto'
import DtoError from '../utils/DtoError'
import { UserBasicInfoDTO } from '../constants/DTO/User/UserProfile/UserBasicInfoDTO'
import { CreateUserEducationDTO } from '../constants/DTO/User/UserProfile/CreateUserEducationDTO'
import { CreateUserProfessionDTO } from '../constants/DTO/User/UserProfile/CreateUserProfessionDTO'
const router = Router()

/*
    Route: /api/v1/user/allUsers
    Method: GET
    Desc: Get all user details
    Access: Protected
    Query: page, limit, search
*/
router.get('/allUsers', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
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

        const { success, status, message, data } = await GetAllUser(userId, page, limit, search)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/user/userDetails
    Method: GET
    Desc: Get user details
    Access: Protected
    Query: userId
*/
router.get('/userDetails', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { accessToken } = cookies as { accessToken: string | undefined }
        if (!accessToken) {
            return ApiError(next, null, req, 400, responseMessage.UNAUTHORIZED)
        }
        const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt

        const queryUserId: string = req.query.userId as string

        const { success, status, message, data } = await GetUserDetails(queryUserId, userId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/user/basicInfo
    Method: PUT
    Desc: Update user basic Info
    Access: Protected
    Body: UserBasicInfoDTO
*/
router.put('/basicInfo', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { accessToken } = cookies as { accessToken: string | undefined }
        if (!accessToken) {
            return ApiError(next, null, req, 400, responseMessage.UNAUTHORIZED)
        }
        const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt

        const body: object = req.body as object

        const requestValidation = await validateDTO(UserBasicInfoDTO, body)
        if (!requestValidation.success) {
            return DtoError(next, req, requestValidation.status, requestValidation.errors)
        }

        const { success, status, message, data } = await UpdateBasicInfo(req.body as UserBasicInfoDTO, userId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/user/education
    Method: POST
    Desc: Create user education
    Access: Protected
    Body: CreateUserEducationDTO
*/
router.post('/education', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { accessToken } = cookies as { accessToken: string | undefined }
        if (!accessToken) {
            return ApiError(next, null, req, 400, responseMessage.UNAUTHORIZED)
        }
        const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt

        const body: object = req.body as object

        const requestValidation = await validateDTO(CreateUserEducationDTO, body)
        if (!requestValidation.success) {
            return DtoError(next, req, requestValidation.status, requestValidation.errors)
        }

        const { success, status, message, data } = await CreateUserEducation(req.body as CreateUserEducationDTO, userId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/user/education
    Method: GET
    Desc: Get all user education
    Access: Protected
    Query: UserId
*/
router.get('/education', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.query.userId as string
        if (!userId) {
            const errMessage = responseMessage.INVALID_REQUEST
            return ApiError(next, new Error(errMessage), req, 400)
        }

        const { success, status, message, data } = await GetAllUserEducation(userId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/user/education/:educationId
    Method: PUT
    Desc: Update user education
    Access: Protected
    Body: Partial<CreateUserEducationDTO>
    Path Variable: educationId
*/
router.put('/education/:educationId', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { accessToken } = cookies as { accessToken: string | undefined }
        if (!accessToken) {
            return ApiError(next, null, req, 400, responseMessage.UNAUTHORIZED)
        }
        const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt

        const educationId = req.params.educationId

        const { success, status, message, data } = await UpdateUserEducation(req.body as Partial<CreateUserEducationDTO>, educationId, userId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/user/education/:educationId
    Method: DELETE
    Desc: Delete user education
    Access: Protected
    Path variable: educationId
*/
router.delete('/education/:educationId', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { accessToken } = cookies as { accessToken: string | undefined }
        if (!accessToken) {
            return ApiError(next, null, req, 400, responseMessage.UNAUTHORIZED)
        }
        const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt

        const educationId = req.params.educationId

        const { success, status, message, data } = await DeleteUserEducation(educationId, userId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/user/profession
    Method: POST
    Desc: Create user profession
    Access: Protected
    Body: CreateUserProfessionDTO
*/
router.post('/profession', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { accessToken } = cookies as { accessToken: string | undefined }
        if (!accessToken) {
            return ApiError(next, null, req, 400, responseMessage.UNAUTHORIZED)
        }
        const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt

        const body: object = req.body as object

        const requestValidation = await validateDTO(CreateUserProfessionDTO, body)
        if (!requestValidation.success) {
            return DtoError(next, req, requestValidation.status, requestValidation.errors)
        }

        const { success, status, message, data } = await CreateUserProfession(req.body as CreateUserProfessionDTO, userId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/user/profession
    Method: GET
    Desc: Get all user profession
    Access: Protected
    Query: UserId
*/
router.get('/profession', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.query.userId as string
        if (!userId) {
            const errMessage = responseMessage.INVALID_REQUEST
            return ApiError(next, new Error(errMessage), req, 400)
        }

        const { success, status, message, data } = await GetAllUserProfession(userId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/user/profession/:professionId
    Method: PUT
    Desc: Update user profession
    Access: Protected
    Body: Partial<CreateUserEducationDTO>
*/
router.put('/profession/:professionId', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { accessToken } = cookies as { accessToken: string | undefined }
        if (!accessToken) {
            return ApiError(next, null, req, 400, responseMessage.UNAUTHORIZED)
        }
        const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt

        const professionId = req.params.professionId

        const { success, status, message, data } = await UpdateUserProfession(req.body as Partial<CreateUserProfessionDTO>, professionId, userId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/user/profession/:professionId
    Method: DELETE
    Desc: Delete user profession
    Access: Protected
    Path variable: professionId
*/
router.delete('/profession/:professionId', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { accessToken } = cookies as { accessToken: string | undefined }
        if (!accessToken) {
            return ApiError(next, null, req, 400, responseMessage.UNAUTHORIZED)
        }
        const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt

        const professionId = req.params.professionId

        const { success, status, message, data } = await DeleteUserProfession(professionId, userId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

export default router
