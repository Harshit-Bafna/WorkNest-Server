import { EUserRole } from '../constants/applicationEnums'

export interface IUser {
    name: string
    emailAddress: string
    password: string
    role: EUserRole
    accountConfirmation: {
        status: boolean
        token: string
        code: string
        timestamp: Date | null
    }
    passwordReset: {
        token: string | null
        expiry: number | null
        lastResetAt: Date | null
    }
    lastLoginAt: Date | null
    consent: boolean
}

export interface IRefreshToken {
    token: string
}