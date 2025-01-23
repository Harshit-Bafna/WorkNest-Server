import ApiError from '../utils/ApiError'
import ApiResponse from '../utils/ApiResponse'
import { Router, Request, Response, NextFunction } from 'express'
import rateLimit from '../middleware/rateLimit'
import responseMessage from '../constants/responseMessage'
import { VerifyToken } from '../utils/helper/syncHelpers'
import config from '../config/config'
import { IDecryptedJwt } from '../types/userTypes'
import { GetAllUser, GetUserDetails } from '../controller/user'
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
        if(page <= 0) {
            return ApiError(next, null, req, 400, responseMessage.INVALID_VALUE('page number'))
        }
        
        const limit: number = Number(req.query.limit as unknown) | 10
        if(limit <= 0) {
            return ApiError(next, null, req, 400, responseMessage.INVALID_VALUE('page limit'))
        }

        const search: string = req.query.search as string

        const {success, status, message, data} = await GetAllUser(userId, page, limit, search)
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

        const {success, status, message, data} = await GetUserDetails(queryUserId, userId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

export default router
