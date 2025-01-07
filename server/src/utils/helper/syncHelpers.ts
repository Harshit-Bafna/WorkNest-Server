import { v4 } from 'uuid'
import { emailRegex } from '../../constants/regex'
import { randomInt } from 'crypto'

export const VerifyEmail = (email: string): boolean => {
    return emailRegex.test(email)
}

export const GenerateRandomId = () => v4()

export const GenerateOTP = (length: number): string => {
    const min = Math.pow(10, length - 1)
    const max = Math.pow(10, length) - 1

    return randomInt(min, max).toString()
}
