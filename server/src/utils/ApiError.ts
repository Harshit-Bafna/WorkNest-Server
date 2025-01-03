import { NextFunction, Request } from 'express'
import { THttpError } from '../types/types'
import responseMessage from '../constants/responseMessage'

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export default (nextFunc: NextFunction, err: Error | unknown, req: Request, errorStatusCode: number = 500): void => {
    const errorObj: THttpError = {
        success: false,
        statusCode: errorStatusCode,
        request: {
            method: req.method,
            url: req.originalUrl
        },
        message: err instanceof Error ? err.message || responseMessage.SOMETHING_WENT_WRONG : responseMessage.SOMETHING_WENT_WRONG,
        data: null,
        trace: err instanceof Error ? { error: err.stack } : null
    }

    // eslint-disable-next-line no-console
    console.error(`CONTROLLER_ERROR`, {
        meta: errorObj
    })

    return nextFunc(errorObj)
}