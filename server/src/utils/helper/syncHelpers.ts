import { v4 } from 'uuid'
import { emailRegex } from '../../constants/regex'
import { randomInt } from 'crypto'
import jwt, { JwtPayload } from 'jsonwebtoken'
import dayjs from 'dayjs'

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

export const VerifyToken = (token: string, secret: string): string | JwtPayload => {
    return jwt.verify(token, secret)
}

export const GetDomain = (url: string) => {
    try {
        const parsedUrl = new URL(url)
        return parsedUrl.hostname
    } catch (error) {
        throw error
    }
}

export const GenerateResetPasswordExpiry = (minute: number) => {
    return dayjs().valueOf() + minute * 60 * 1000
}

export const GeneratePassword = (): string => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const digits = '0123456789'
    const specialChars = '!@#$%^&*()_+[]{}|;:,.<>?'

    const getRandomChar = (charset: string) => charset[Math.floor(Math.random() * charset.length)]

    let password = [getRandomChar(uppercase), getRandomChar(lowercase), getRandomChar(digits), getRandomChar(specialChars)]

    const allChars = uppercase + lowercase + digits + specialChars
    for (let i = password.length; i < 8; i++) {
        password.push(getRandomChar(allChars))
    }

    password = password.sort(() => Math.random() - 0.5)

    return password.join('')
}
