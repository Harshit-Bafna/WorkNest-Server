import { NextFunction, Request } from 'express'
import { THttpError } from '../types/types'
import responseMessage from '../constants/responseMessage'
import logger from './logger'

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export default (nextFunc: NextFunction, err: Error | unknown = null, req: Request, errorStatusCode: number = 500, errMessage: string = responseMessage.SOMETHING_WENT_WRONG): void => {
    const errorObj: THttpError = {
        success: false,
        statusCode: errorStatusCode,
        request: {
            method: req.method,
            url: req.originalUrl
        },
        message: err instanceof Error ? err.message : errMessage,
        data: null,
        trace: err instanceof Error ? { error: err.stack } : null
    }

    logger.error(`CONTROLLER_ERROR`, {
        meta: errorObj
    })

    return nextFunc(errorObj)
}