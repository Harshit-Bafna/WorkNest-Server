import ApiError from '../utils/ApiError'
import ApiResponse from '../utils/ApiResponse'
import { Router, Request, Response, NextFunction } from 'express'
import { RegisterUser, VerifyAccount } from '../controller/user'
import { UserRegistrationDTO } from '../constants/DTO/User/UserRegistrationDTO'
import { validateDTO } from '../utils/validateDto'
import DtoError from '../utils/DtoError'
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

        const createUser = await VerifyAccount(token, code)
        
        if (!createUser.success) {
            return ApiError(next, null, req, createUser.status, createUser.message)
        }
        return ApiResponse(req, res, createUser.status, createUser.message, createUser.data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

export default router
