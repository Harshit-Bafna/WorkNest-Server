import { ClassConstructor, plainToClass } from 'class-transformer'
import { validate } from 'class-validator'

export interface ValidationError {
    key: string
    message: string
}

interface ValidationResult {
    success: boolean
    status: number
    errors: ValidationError[]
}

export const validateDTO = async (dto: ClassConstructor<object>, body: object): Promise<ValidationResult> => {
    const dtoInstance: object = plainToClass(dto, body)

    const errors = await validate(dtoInstance)

    if (errors.length > 0) {
        const formattedErrors: ValidationError[] = []
        errors.map((err) => {
            const error:ValidationError = {
                key: err.property,
                message: err.constraints ? Object.values(err.constraints)[0] : 'Unknown error'
            } 
            formattedErrors.push(error)
        })

        return {
            success: false,
            status: 400,
            errors: formattedErrors
        }
    }

    return {
        success: true,
        status: 200,
        errors: []
    }
}
