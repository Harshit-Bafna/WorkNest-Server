import ApiError from '../utils/ApiError'
import ApiResponse from '../utils/ApiResponse'
import { Router, Request, Response, NextFunction } from 'express'
import { validateDTO } from '../utils/validateDto'
import DtoError from '../utils/DtoError'
import rateLimit from '../middleware/rateLimit'
import { RegisterOrganisationDTO } from '../constants/DTO/Organisation/RegisterOrganisationDTO'
import { RegisterOrganisation } from '../controller/organisation'
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

export default router
