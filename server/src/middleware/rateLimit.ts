import { NextFunction, Request, Response } from 'express'
import config from '../config/config'
import { EApplicationEnvironment } from '../constants/applicationEnums'
import { rateLimiterMongo } from '../config/rateLimiter'
import ApiError from '../utils/ApiError'
import responseMessage from '../constants/responseMessage'

export default (req: Request, _: Response, next: NextFunction) => {
    if (config.ENV === EApplicationEnvironment.DEVELOPMENT) {
        return next()
    }

    if (rateLimiterMongo) {
        rateLimiterMongo
            .consume(req.ip as string, 1)
            .then(() => {
                next()
            })
            .catch(() => {
                ApiError(next, new Error(responseMessage.TOO_MANY_REQUESTS), req, 429)
            })
    }
}