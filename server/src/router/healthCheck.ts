import { getHealth } from '../controller/healthCheck'
import ApiError from '../utils/ApiError'
import ApiResponse from '../utils/ApiResponse'
import { Router, Request, Response, NextFunction } from 'express'
const router = Router()

/*
    Route: /api/v1/health
    Method: GET
    Desc: Get system heatlh
    Access: Protected
*/
router.get('/', (req: Request, res: Response, next: NextFunction) => {
    try {
        const healthData = getHealth()
        if (!healthData.success) {
            return ApiError(next, healthData.message, req, healthData.status)
        }
        return ApiResponse(req, res, healthData.status, healthData.message, healthData.data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

export default router
