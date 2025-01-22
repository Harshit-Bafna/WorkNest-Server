import { Request } from 'express'
import { EUserRole } from '../constants/Enums/applicationEnums'
import { JwtPayload } from 'jsonwebtoken'
import mongoose from 'mongoose'

export interface IUser {
    name: string
    emailAddress: string
    password: string
    role: EUserRole,
    organisation: {
        isAssociated: boolean
        organisationId: mongoose.Schema.Types.ObjectId | null
        role: string | null
    },
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

export interface IOrganisation {
    name: string
    emailAddress: string
    logo: string | null
    website: string | null
    registrationNumber: string | null
    adminId: mongoose.Schema.Types.ObjectId
    consent: boolean
}

export interface IRefreshToken {
    token: string
}

export interface IAuthenticatedRequest extends Request {
    authenticatedUser: IUser
}

export interface IDecryptedJwt extends JwtPayload {
    userId: string
    role: string
    name: string
}
