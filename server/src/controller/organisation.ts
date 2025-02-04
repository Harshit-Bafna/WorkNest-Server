import mongoose from 'mongoose'
import config from '../config/config'
import { EUserRole } from '../constants/Enums/applicationEnums'
import { RegisterOrganisationDTO } from '../constants/DTO/Organisation/RegisterOrganisationDTO'
import responseMessage from '../constants/responseMessage'
import { emailVerificationTemplate } from '../constants/template/emailVerificationTemplate'
import userModel from '../model/user/userModel'
import { sendEmail } from '../service/nodemailerService'
import { IDecryptedJwt, IOrganisation, IUser } from '../types/userTypes'
import { ApiMessage } from '../utils/ApiMessage'
import { EncryptPassword, FindOrganisationByEmail, FindUserByEmail, VerifyPassword } from '../utils/helper/asyncHelpers'
import { GenerateRandomId, GenerateOTP, GeneratePassword, VerifyToken } from '../utils/helper/syncHelpers'
import organisationModel from '../model/user/organisationModel'
import { organisationRegistrationConfirmationTemplate } from '../constants/template/organisationRegistrationSuccesTemplate'
import { RegisterOrganisationEmployeeDTO } from '../constants/DTO/Organisation/RegisterOrganisationEmployeeDTO'
import { invitationTemplate } from '../constants/template/invitationTemplate'
import { AcceptInvitationDTO } from '../constants/DTO/Organisation/AcceptInvitationDTO'
import dayjs from 'dayjs'
import { verificationSuccessfullTemplate } from '../constants/template/verificationSuccessfullTemplate'
import { passwordResetSuccessTemplate } from '../constants/template/passwordResetSuccessTemplate'

export const RegisterOrganisation = async (organisationDetails: RegisterOrganisationDTO): Promise<ApiMessage> => {
    const { name, emailAddress, logo, website, registrationNumber, adminName, password, conscent } = organisationDetails
    try {
        const admin = await FindUserByEmail(emailAddress)
        const organisation = await FindOrganisationByEmail(emailAddress)
        if (admin || organisation) {
            return {
                success: false,
                status: 422,
                message: responseMessage.ALREADY_IN_USE('EmailAddress'),
                data: null
            }
        }

        const encryptedPassword = await EncryptPassword(password)

        const token = GenerateRandomId()
        const code = GenerateOTP(6)

        const userPayload: IUser = {
            name: adminName,
            emailAddress: emailAddress,
            organisation: {
                isAssociated: true,
                organisationId: null,
                role: EUserRole.ORGANISATION_ADMIN
            },
            accountConfirmation: {
                status: false,
                token: token,
                code: code,
                timestamp: null
            },
            passwordReset: {
                token: null,
                expiry: null,
                lastResetAt: null
            },
            password: encryptedPassword,
            role: EUserRole.ORGANISATION_ADMIN,
            lastLoginAt: null,
            consent: conscent
        }

        const newUser = await userModel.create(userPayload)

        const confirmationUrl = `${config.SERVER_URL}/confirmation/${token}?code=${code}`
        const to = [emailAddress]
        const confirmAccountSubject = 'Confirm Your Account'
        const confirmAccountHTML = emailVerificationTemplate(confirmationUrl)
        await sendEmail(to, confirmAccountSubject, confirmAccountHTML)

        const organisationPayload: IOrganisation = {
            name: name,
            emailAddress: emailAddress,
            logo: logo ? logo : null,
            website: website ? website : null,
            registrationNumber: registrationNumber,
            adminId: newUser.id as mongoose.Schema.Types.ObjectId,
            consent: conscent
        }

        const newOrganisation = await organisationModel.create(organisationPayload)
        const organisationSetupSuccessSubject = 'Organisation Registered successfully'
        const organisationSetupSuccessHTML = organisationRegistrationConfirmationTemplate(adminName, name, registrationNumber)
        await sendEmail(to, organisationSetupSuccessSubject, organisationSetupSuccessHTML)

        newUser.organisation.organisationId = newOrganisation.id as mongoose.Schema.Types.ObjectId
        await newUser.save()

        return {
            success: true,
            status: 201,
            message: responseMessage.SUCCESS,
            data: {
                adminDetails: newUser,
                organisationDetails: newOrganisation
            }
        }
    } catch (error) {
        const errMessage = error instanceof Error ? error.message : responseMessage.INTERNAL_SERVER_ERROR
        return {
            success: false,
            status: 500,
            message: errMessage,
            data: null
        }
    }
}

export const AddEmployeeInOrganization = async (input: RegisterOrganisationEmployeeDTO): Promise<ApiMessage> => {
    const { organizationId, name, emailAddress } = input
    let role = input.role

    if (role) {
        if (role !== EUserRole.ORGANISATION_USER && role !== EUserRole.ORGANISATION_MANAGER) {
            return {
                success: false,
                status: 404,
                message: responseMessage.INVALID_REQUEST,
                data: null
            }
        }
    } else {
        role = EUserRole.ORGANISATION_USER
    }

    try {
        const organisation = await organisationModel.findById(organizationId)
        if (!organisation) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('Organization'),
                data: null
            }
        }

        const password = GeneratePassword()
        const encryptedPassword = await EncryptPassword(password)
        const token = GenerateRandomId()
        const code = GenerateOTP(6)

        const userPayload: IUser = {
            name: name,
            emailAddress: emailAddress,
            organisation: {
                isAssociated: true,
                organisationId: organisation.id as mongoose.Schema.Types.ObjectId,
                role: role
            },
            accountConfirmation: {
                status: false,
                token: token,
                code: code,
                timestamp: null
            },
            passwordReset: {
                token: null,
                expiry: null,
                lastResetAt: null
            },
            password: encryptedPassword,
            role: EUserRole.ORGANISATION_USER,
            lastLoginAt: null,
            consent: true
        }

        const newUser = await userModel.create(userPayload)
        if (!newUser) {
            return {
                success: false,
                status: 500,
                message: responseMessage.ERROR_CREATION('user'),
                data: null
            }
        }

        const invitationUrl = `${config.CLIENT_URL}/invitation/${token}?code=${code}`
        const to = [emailAddress]
        const invitationSubject = `WorkNest - Invitation from ${organisation.name}`
        const invitationHTML = invitationTemplate(invitationUrl, password, organisation.name)
        await sendEmail(to, invitationSubject, invitationHTML)

        return {
            success: true,
            status: 201,
            message: responseMessage.SUCCESS,
            data: {
                newUser: newUser
            }
        }
    } catch (error) {
        const errMessage = error instanceof Error ? error.message : responseMessage.SOMETHING_WENT_WRONG
        return {
            success: false,
            status: 500,
            message: errMessage,
            data: null
        }
    }
}

export const ValidateInvitation = async (input: AcceptInvitationDTO, token: string, code: string): Promise<ApiMessage> => {
    const { oldPassword, newPassword, confirmPassword } = input
    try {
        const user = await userModel
            .findOne({
                'accountConfirmation.token': token,
                'accountConfirmation.code': code
            })
            .select('+password')
        if (!user) {
            return {
                success: false,
                status: 400,
                message: responseMessage.INVALID_CONFIRMATION_LINK,
                data: null
            }
        } else if (user.accountConfirmation.status) {
            return {
                success: false,
                status: 400,
                message: responseMessage.ACCOUNT_ALREADY_CONFIRMED,
                data: null
            }
        }

        const isPasswordMatching = await VerifyPassword(oldPassword, user.password)
        if (!isPasswordMatching) {
            return {
                success: false,
                status: 400,
                message: responseMessage.WRONG_OLD_PASSWORD,
                data: null
            }
        }

        if (newPassword !== confirmPassword) {
            return {
                success: false,
                status: 400,
                message: responseMessage.PASSWORD_NOT_MATCH,
                data: null
            }
        }

        if (newPassword === oldPassword) {
            return {
                success: false,
                status: 400,
                message: responseMessage.OLD_NEW_PASSWORD_SAME,
                data: null
            }
        }

        const newEncryptedPassword = await EncryptPassword(newPassword)
        user.password = newEncryptedPassword
        user.accountConfirmation.status = true
        user.accountConfirmation.timestamp = dayjs().utc().toDate()
        await user.save()

        const to = [user.emailAddress]
        const passwordSubject = 'Password change successfully'
        const confirmationSubject = 'Welcome to Worknest: Account verified'
        const passwordHTML = passwordResetSuccessTemplate()
        const confirmationHTML = verificationSuccessfullTemplate()

        await sendEmail(to, passwordSubject, passwordHTML)
        await sendEmail(to, confirmationSubject, confirmationHTML)

        return {
            success: true,
            status: 200,
            message: responseMessage.PASSWORD_CHANGED,
            data: null
        }
    } catch (error) {
        const errMessage = error instanceof Error ? error.message : responseMessage.SOMETHING_WENT_WRONG
        return {
            success: false,
            status: 500,
            message: errMessage,
            data: null
        }
    }
}

export const GetAllOrganizations = async (accessToken: string, page: number, limit: number, search: string | null): Promise<ApiMessage> => {
    const skip = (page - 1) * limit
    try {
        const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt
        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        }

        const roleBasedQueries: Record<string, object> = {
            [EUserRole.MASTER_ADMIN]: {},
            [EUserRole.ADMIN]: {}
        }

        const query = roleBasedQueries[user.role] || null
        if (!query) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        }

        if (search) {
            const searchQuery = {
                $or: [{ name: { $regex: search, $options: 'i' } }, { emailAddress: { $regex: search, $options: 'i' } }]
            }
            Object.assign(query, searchQuery)
        }

        const totalCount = await organisationModel.countDocuments(query)
        const organizations = await organisationModel
            .find(query, 'name emailAddress logo website registrationNumber consent adminId createdAt')
            .populate('adminId', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                organizations: organizations,
                totalCount: totalCount,
                page: page,
                limit: limit
            }
        }
    } catch (error) {
        const errMessage = error instanceof Error ? error.message : responseMessage.SOMETHING_WENT_WRONG
        return {
            success: false,
            status: 500,
            message: errMessage,
            data: null
        }
    }
}

export const GetOrganizationDetails = async (accessToken: string, organizationId: string): Promise<ApiMessage> => {
    try {
        const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt
        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        } else if (!user.organisation.isAssociated) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        } else if (user.organisation.organisationId !== (organizationId as unknown)) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        } else if (user.role === EUserRole.USER) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        }

        const organization = await organisationModel.findById(organizationId)
        if (!organization) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('Organization'),
                data: null
            }
        }

        const organizationAdmin = await userModel.findOne({
            'organisation.organisationId': organizationId,
            role: EUserRole.ORGANISATION_ADMIN
        })
        if (!organizationAdmin) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('Organization admin'),
                data: null
            }
        }

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                organization: organization,
                organizationAdmin: organizationAdmin
            }
        }
    } catch (error) {
        const errMessage = error instanceof Error ? error.message : responseMessage.SOMETHING_WENT_WRONG
        return {
            success: false,
            status: 500,
            message: errMessage,
            data: null
        }
    }
}
