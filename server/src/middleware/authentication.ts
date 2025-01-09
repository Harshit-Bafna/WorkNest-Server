import { NextFunction, Request, Response } from 'express'
import { IAuthenticatedRequest, IDecryptedJwt } from '../types/userTypes'
import { VerifyToken } from '../utils/helper/syncHelpers'
import config from '../config/config'
import userModel from '../model/user/userModel'
import ApiError from '../utils/ApiError'
import responseMessage from '../constants/responseMessage'

export default async (request: Request, _: Response, next: NextFunction) => {
    try {
        const req = request as IAuthenticatedRequest
        const { cookies } = req
        const { accessToken } = cookies as {
            accessToken: string | undefined
        }

        if (accessToken) {            
            const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt
            const user = await userModel.findById(userId)
            if (user) {
                req.authenticatedUser = user
            }
            return next()
        }

        return ApiError(next, new Error(responseMessage.UNAUTHORIZED), req, 401)
    } catch (error) {
        return ApiError(next, error, request, 401)
    }
}
