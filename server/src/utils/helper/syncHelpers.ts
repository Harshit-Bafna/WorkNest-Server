import { v4 } from 'uuid'
import { emailRegex } from '../../constants/regex'
import { randomInt } from 'crypto'
import jwt from 'jsonwebtoken'

export const VerifyEmail = (email: string): boolean => {
    return emailRegex.test(email)
}

export const GenerateRandomId = () => v4()

export const GenerateOTP = (length: number): string => {
    const min = Math.pow(10, length - 1)
    const max = Math.pow(10, length) - 1

    return randomInt(min, max).toString()
}

export const GenerateJwtToken = (payload: object, secret: string, expiry: number): string => {
    return jwt.sign(payload, secret, {
        expiresIn: expiry
    })
}
