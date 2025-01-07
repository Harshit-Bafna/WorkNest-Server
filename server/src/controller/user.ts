import config from '../config/config'
import { UserRegistrationDTO } from '../constants/DTO/User/UserRegistrationDTO'
import responseMessage from '../constants/responseMessage'
import { emailVerificationTemplate } from '../constants/template/emailVerificationTemplate'
import userModel from '../model/userModel'
import { sendEmail } from '../service/nodemailerService'
import { IUser } from '../types/userTypes'
import { ApiMessage } from '../utils/ApiMessage'
import { EncryptPassword, FindUserByEmail } from '../utils/helper/asyncHelpers'
import { GenerateOTP, GenerateRandomId } from '../utils/helper/syncHelpers'

export const RegisterUser = async (input: UserRegistrationDTO): Promise<ApiMessage> => {
    const { name, emailAddress, password, conscent, role } = input

    try {
        const user = await FindUserByEmail(emailAddress)
        if (user) {
            return {
                success: false,
                status: 422,
                message: responseMessage.ALREADY_EXISTS('User', 'emailAddress'),
                data: null
            }
        }

        const encryptedPassword = await EncryptPassword(password)

        const token = GenerateRandomId()
        const code = GenerateOTP(6)

        const payload: IUser = {
            name: name,
            emailAddress: emailAddress,
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
            role: role,
            lastLoginAt: null,
            consent: conscent
        }

        const newUser = await userModel.create(payload)

        const confirmationUrl = `${config.CLIENT_URL}/confirmation/${token}?code=${code}`
        const to = [emailAddress]
        const subject = 'Confirm Your Account'
        const HTML = emailVerificationTemplate(confirmationUrl)
        await sendEmail(to, subject, HTML)

        return {
            success: true,
            status: 201,
            message: responseMessage.SUCCESS,
            data: {
                newUser: newUser
            }
        }
    } catch (error) {
        return {
            success: false,
            status: 500,
            message: `User registration failed: ${error as string}`,
            data: null
        }
    }
}
