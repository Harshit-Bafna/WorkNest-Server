import ApiError from '../utils/ApiError'
import ApiResponse from '../utils/ApiResponse'
import { Router, Request, Response, NextFunction } from 'express'
import { ChangePassword, ForgotPassword, LoginUser, LogoutUser, RefreshToken, RegisterUser, ResetPasseord, VerifyAccount } from '../controller/auth'
import { UserRegistrationDTO } from '../constants/DTO/User/UserRegistrationDTO'
import { validateDTO } from '../utils/validateDto'
import DtoError from '../utils/DtoError'
import { UserLoginDTO } from '../constants/DTO/User/UserLoginDTO'
import config from '../config/config'
import { EApplicationEnvironment } from '../constants/applicationEnums'
import { GetDomain } from '../utils/helper/syncHelpers'
import responseMessage from '../constants/responseMessage'
import { UserResetPasswordDTO } from '../constants/DTO/User/ResetPasswordDTO'
import { UserChangePasswordDTO } from '../constants/DTO/User/ChangePasswordDTO'
import authentication from '../middleware/authentication'
import rateLimit from '../middleware/rateLimit'
const router = Router()

/*
    Route: /api/v1/auth/create
    Method: POST
    Desc: Register a new User
    Access: Public
    Body: UserRegistrationDTO
*/
router.post('/create', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body: object = req.body as object

        const requestValidation = await validateDTO(UserRegistrationDTO, body)
        if (!requestValidation.success) {
            return DtoError(next, req, requestValidation.status, requestValidation.errors)
        }

        const createUser = await RegisterUser(req.body as UserRegistrationDTO)
        if (!createUser.success) {
            return ApiError(next, null, req, createUser.status, createUser.message)
        }
        return ApiResponse(req, res, createUser.status, createUser.message, createUser.data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/auth/login
    Method: POST
    Desc: Login a user
    Access: Public
    Body: UserLoginDTO
*/
router.post('/login', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body: object = req.body as object

        const requestValidation = await validateDTO(UserLoginDTO, body)
        if (!requestValidation.success) {
            return DtoError(next, req, requestValidation.status, requestValidation.errors)
        }

        const userDetails = await LoginUser(req.body as UserLoginDTO)
        if (!userDetails.success) {
            return ApiError(next, null, req, userDetails.status, userDetails.message)
        }

        const DOMAIN = GetDomain(config.SERVER_URL as string)

        const accessToken = (userDetails.data as { accessToken: string }).accessToken
        const refreshToken = (userDetails.data as { refreshToken: string }).refreshToken

        res.cookie('accessToken', accessToken, {
            path: '/',
            domain: DOMAIN,
            sameSite: 'strict',
            maxAge: 1000 * config.ACCESS_TOKEN.EXPIRY,
            secure: !(config.ENV === EApplicationEnvironment.DEVELOPMENT)
        }).cookie('refreshToken', refreshToken, {
            path: '/',
            domain: DOMAIN,
            sameSite: 'strict',
            maxAge: 1000 * config.REFRESH_TOKEN.EXPIRY,
            secure: !(config.ENV === EApplicationEnvironment.DEVELOPMENT)
        })
        return ApiResponse(req, res, userDetails.status, userDetails.message, userDetails.data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/auth/confirmation/:token
    Method: POST
    Desc: Verify user email
    Access: Public
    Params: token
    Query: code
*/
router.put('/confirmation/:token', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token: string = req.params.token
        const code: string = req.query.code as string

        if (!token) {
            return ApiError(next, 'Token is required', req, 404)
        }
        if (!code) {
            return ApiError(next, 'Code is required', req, 404)
        }

        const verifyUser = await VerifyAccount(token, code)

        if (!verifyUser.success) {
            return ApiError(next, null, req, verifyUser.status, verifyUser.message)
        }
        return ApiResponse(req, res, verifyUser.status, verifyUser.message, verifyUser.data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/auth/logout
    Method: POST
    Desc: Logout user
    Access: Public
*/
router.put('/logout', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { refreshToken } = cookies as { refreshToken: string | undefined }

        const userLoggedOut = await LogoutUser(refreshToken)
        if (!userLoggedOut.success) {
            return ApiError(next, null, req, userLoggedOut.status, userLoggedOut.message)
        }

        const DOMAIN = GetDomain(config.SERVER_URL as string)

        res.clearCookie('accessToken', {
            path: '/',
            domain: DOMAIN,
            sameSite: 'strict',
            maxAge: 1000 * config.ACCESS_TOKEN.EXPIRY,
            secure: !(config.ENV === EApplicationEnvironment.DEVELOPMENT)
        })
        res.clearCookie('refreshToken', {
            path: '/',
            domain: DOMAIN,
            sameSite: 'strict',
            maxAge: 1000 * config.REFRESH_TOKEN.EXPIRY,
            secure: !(config.ENV === EApplicationEnvironment.DEVELOPMENT)
        })

        return ApiResponse(req, res, userLoggedOut.status, userLoggedOut.message, userLoggedOut.data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/auth/refresh-token
    Method: POST
    Desc: Register a new User
    Access: Public
    Body: UserRegistrationDTO
*/
router.post('/refresh-token', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { refreshToken } = cookies as { refreshToken: string | undefined }

        const token = await RefreshToken(refreshToken)
        if (!token.success) {
            return ApiError(next, null, req, token.status, token.message)
        }

        const DOMAIN = GetDomain(config.SERVER_URL as string)

        const accessToken = (token.data as { accessToken: string }).accessToken

        res.cookie('accessToken', accessToken, {
            path: '/',
            domain: DOMAIN,
            sameSite: 'strict',
            maxAge: 1000 * config.ACCESS_TOKEN.EXPIRY,
            secure: !(config.ENV === EApplicationEnvironment.DEVELOPMENT)
        })

        return ApiResponse(req, res, token.status, token.message, token.data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/auth/forgot-password
    Method: PUT
    Desc: Initiate reset password using forgot password
    Access: Public
    Query: emailAddress
*/
router.put('/forgot-password', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const emailAddress = req.query.emailAddress as string
        if (!emailAddress) {
            return ApiError(next, null, req, 400, responseMessage.IS_REQUIRED('Email'))
        }

        const token = await ForgotPassword(emailAddress)
        if (!token.success) {
            return ApiError(next, null, req, token.status, token.message)
        }

        return ApiResponse(req, res, token.status, token.message, token.data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/auth/reset-password/:token
    Method: PUT
    Desc: Resset pasword
    Access: Public
    Body: newPassword
    Params: token
*/
router.put('/reset-password/:token', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.params.token
        if (!token) {
            return ApiError(next, null, req, 400, responseMessage.NOT_FOUND('Token'))
        }

        const body: object = req.body as object

        const requestValidation = await validateDTO(UserResetPasswordDTO, body)
        if (!requestValidation.success) {
            return DtoError(next, req, requestValidation.status, requestValidation.errors)
        }

        const passwordResetDetails = await ResetPasseord(token, req.body as UserResetPasswordDTO)
        if (!passwordResetDetails.success) {
            return ApiError(next, null, req, passwordResetDetails.status, passwordResetDetails.message)
        }

        return ApiResponse(req, res, passwordResetDetails.status, passwordResetDetails.message, passwordResetDetails.data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/auth/change-password
    Method: PUT
    Desc: Change pasword
    Access: Protected
    Body: UserChangePasswordDTO
*/
router.put('/change-password', authentication, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body: object = req.body as object

        const requestValidation = await validateDTO(UserChangePasswordDTO, body)
        if (!requestValidation.success) {
            return DtoError(next, req, requestValidation.status, requestValidation.errors)
        }

        const { cookies } = req
        const { accessToken } = cookies as { accessToken: string | undefined }
        if (!accessToken) {
            return ApiError(next, null, req, 400, responseMessage.UNAUTHORIZED)
        }

        const passwordChangeDetails = await ChangePassword(accessToken, req.body as UserChangePasswordDTO)
        if (!passwordChangeDetails.success) {
            return ApiError(next, null, req, passwordChangeDetails.status, passwordChangeDetails.message)
        }

        return ApiResponse(req, res, passwordChangeDetails.status, passwordChangeDetails.message, passwordChangeDetails.data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

export default router
