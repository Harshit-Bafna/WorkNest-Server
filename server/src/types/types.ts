import { ValidationError } from '../utils/validateDto'

export type THttpResponse = {
    success: boolean
    statusCode: number
    request: {
        method: string
        url: string
    }
    message: string
    data: unknown
}

export type THttpError = {
    success: boolean
    statusCode: number
    request: {
        method: string
        url: string
    }
    message: string
    data: unknown
    trace?: object | null
}

export type TDtoError = {
    success: boolean
    statusCode: number
    request: {
        method: string
        url: string
    }
    message: ValidationError[]
    data: unknown
    trace: null
}
