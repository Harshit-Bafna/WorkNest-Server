import { NextFunction, Request } from 'express'
import { TDtoError } from '../types/types'
import logger from './logger'
import { ValidationError } from './validateDto'

export default (nextFunc: NextFunction, req: Request, errorStatusCode: number = 500, errMessage: ValidationError[]): void => {
    const errorObj: TDtoError = {
        success: false,
        statusCode: errorStatusCode,
        request: {
            method: req.method,
            url: req.originalUrl
        },
        message: errMessage,
        data: null,
        trace: null
    }

    logger.error(`CONTROLLER_ERROR`, {
        meta: errorObj
    })

    return nextFunc(errorObj)
}
