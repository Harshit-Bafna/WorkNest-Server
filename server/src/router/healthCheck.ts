import { getHealth } from '../controller/healthCheck'
import ApiError from '../utils/ApiError'
import ApiResponse from '../utils/ApiResponse'
import { Router, Request, Response, NextFunction } from 'express'
const router = Router()

router.get('/', (req: Request, res: Response, next: NextFunction) => {
    try {
        const healthData = getHealth()
        ApiResponse(req, res, healthData.status, healthData.message, healthData.data)
    } catch (err) {
        ApiError(next, err, req, 500)
    }
})

export default router
