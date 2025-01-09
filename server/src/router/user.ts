import ApiError from '../utils/ApiError'
import ApiResponse from '../utils/ApiResponse'
import { Router, Request, Response, NextFunction } from 'express'
import { LoginUser, logoutUser, RegisterUser, VerifyAccount } from '../controller/user'
import { UserRegistrationDTO } from '../constants/DTO/User/UserRegistrationDTO'
import { validateDTO } from '../utils/validateDto'
import DtoError from '../utils/DtoError'
import { UserLoginDTO } from '../constants/DTO/User/UserLoginDTO'
import config from '../config/config'
import { EApplicationEnvironment } from '../constants/applicationEnums'
import { GetDomain } from '../utils/helper/syncHelpers'
const router = Router()

/*
    Route: /api/v1/user/create
    Method: POST
    Desc: Register a new User
    Access: Public
    Body: UserRegistrationDTO
*/
router.post('/create', async (req: Request, res: Response, next: NextFunction) => {
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
    Route: /api/v1/user/login
    Method: POST
    Desc: Login a user
    Access: Public
    Body: UserLoginDTO
*/
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
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
    Route: /api/v1/user/confirmation/:token
    Method: POST
    Desc: Verify user email
    Access: Public
    Params: token
    Query: code
*/
router.put('/confirmation/:token', async (req: Request, res: Response, next: NextFunction) => {
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
    Route: /api/v1/user/logout
    Method: POST
    Desc: Logout user
    Access: Public
*/
router.put('/logout', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const {refreshToken} = cookies as {refreshToken: string | undefined}

        const userLoggedOut = await logoutUser(refreshToken)
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

export default router
