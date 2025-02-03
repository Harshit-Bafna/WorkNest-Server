import ApiError from '../utils/ApiError'
import ApiResponse from '../utils/ApiResponse'
import { Router, Request, Response, NextFunction } from 'express'
import { validateDTO } from '../utils/validateDto'
import DtoError from '../utils/DtoError'
import rateLimit from '../middleware/rateLimit'
import { RegisterOrganisationDTO } from '../constants/DTO/Organisation/RegisterOrganisationDTO'
import { AddEmployeeInOrganization, GetAllOrganizations, GetOrganizationDetails, RegisterOrganisation, ValidateInvitation } from '../controller/organisation'
import authentication from '../middleware/authentication'
import { RegisterOrganisationEmployeeDTO } from '../constants/DTO/Organisation/RegisterOrganisationEmployeeDTO'
import { AcceptInvitationDTO } from '../constants/DTO/Organisation/AcceptInvitationDTO'
import responseMessage from '../constants/responseMessage'
const router = Router()

/*
    Route: /api/v1/organisation/create
    Method: POST
    Desc: Register a new organisation
    Access: Public
    Body: UserRegistrationDTO
*/
router.post('/create', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body: object = req.body as object

        const requestValidation = await validateDTO(RegisterOrganisationDTO, body)
        if (!requestValidation.success) {
            return DtoError(next, req, requestValidation.status, requestValidation.errors)
        }

        const createOrganisation = await RegisterOrganisation(req.body as RegisterOrganisationDTO)
        if (!createOrganisation.success) {
            return ApiError(next, null, req, createOrganisation.status, createOrganisation.message)
        }
        return ApiResponse(req, res, createOrganisation.status, createOrganisation.message, createOrganisation.data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/organisation/addEmployee
    Method: POST
    Desc: Add employee to organization
    Access: Protected
    Body: RegisterOrganisationEmployeeDTO
*/
router.post('/addEmployee', rateLimit, authentication, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body: object = req.body as object

        const requestValidation = await validateDTO(RegisterOrganisationEmployeeDTO, body)
        if (!requestValidation.success) {
            return DtoError(next, req, requestValidation.status, requestValidation.errors)
        }

        const addEmployeeInOrganization = await AddEmployeeInOrganization(req.body as RegisterOrganisationEmployeeDTO)
        if (!addEmployeeInOrganization.success) {
            return ApiError(next, null, req, addEmployeeInOrganization.status, addEmployeeInOrganization.message)
        }
        return ApiResponse(req, res, addEmployeeInOrganization.status, addEmployeeInOrganization.message, addEmployeeInOrganization.data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/organisation/invitation/:token
    Method: POST
    Desc: Invitation validation and password change
    Access: Public
    Body: RegisterOrganisationEmployeeDTO
*/
router.post('/invitation/:token', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token: string = req.params.token
        const code: string = req.query.code as string
        if (!token) {
            return ApiError(next, 'Token is required', req, 404)
        }
        if (!code) {
            return ApiError(next, 'Code is required', req, 404)
        }

        const body: object = req.body as object
        const requestValidation = await validateDTO(AcceptInvitationDTO, body)
        if (!requestValidation.success) {
            return DtoError(next, req, requestValidation.status, requestValidation.errors)
        }

        const invidationValidation = await ValidateInvitation(req.body as AcceptInvitationDTO, token, code)
        if (!invidationValidation.success) {
            return ApiError(next, null, req, invidationValidation.status, invidationValidation.message)
        }
        return ApiResponse(req, res, invidationValidation.status, invidationValidation.message, invidationValidation.data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/organisation/getAll
    Method: GET
    Desc: Get all organizations
    Access: Protected
    Query: page, limit, search
*/
router.get('/getAll', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { accessToken } = cookies as { accessToken: string }

        const page: number = req.query.page ? Number(req.query.page) : 1
        const limit: number = req.query.limit ? Number(req.query.limit) : 10
        const search: string = req.query.search as string

        const {success, status, message, data} = await GetAllOrganizations(accessToken, page, limit, search)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/organisation/detail/:organizationId
    Method: GET
    Desc: Get organization details
    Access: Protected
    Params: organizationId
*/
router.get('/detail/:organizationId', rateLimit, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cookies } = req
        const { accessToken } = cookies as { accessToken: string }

        const organizationId = req.params.organizationId
        if(!organizationId) {
            const errMessage = responseMessage.INVALID_REQUEST
            return ApiError(next, new Error(errMessage), req, 400)
        }

        const {success, status, message, data} = await GetOrganizationDetails(accessToken, organizationId)
        if (!success) {
            return ApiError(next, null, req, status, message)
        }
        return ApiResponse(req, res, status, message, data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

export default router
