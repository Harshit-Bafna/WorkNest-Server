import mongoose from 'mongoose'
import config from '../config/config'
import { EUserRole } from '../constants/applicationEnums'
import { RegisterOrganisationDTO } from '../constants/DTO/Organisation/RegisterOrganisationDTO'
import responseMessage from '../constants/responseMessage'
import { emailVerificationTemplate } from '../constants/template/emailVerificationTemplate'
import userModel from '../model/user/userModel'
import { sendEmail } from '../service/nodemailerService'
import { IOrganisation, IUser } from '../types/userTypes'
import { ApiMessage } from '../utils/ApiMessage'
import { EncryptPassword, FindOrganisationByEmail, FindUserByEmail } from '../utils/helper/asyncHelpers'
import { GenerateRandomId, GenerateOTP } from '../utils/helper/syncHelpers'
import organisationModel from '../model/user/organisationModel'
import { organisationRegistrationConfirmationTemplate } from '../constants/template/organisationRegistrationSuccesTemplate'

export const RegisterOrganisation = async (
    organisationDetails: RegisterOrganisationDTO,
): Promise<ApiMessage> => {
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
