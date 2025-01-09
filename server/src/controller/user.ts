import config from '../config/config'
import { UserLoginDTO } from '../constants/DTO/User/UserLoginDTO'
import { UserRegistrationDTO } from '../constants/DTO/User/UserRegistrationDTO'
import responseMessage from '../constants/responseMessage'
import { emailVerificationTemplate } from '../constants/template/emailVerificationTemplate'
import { verificationSuccessfullTemplate } from '../constants/template/verificationSuccessfullTemplate'
import refreshTokenModel from '../model/user/refreshTokenModel'
import userModel from '../model/user/userModel'
import { sendEmail } from '../service/nodemailerService'
import { IRefreshToken, IUser } from '../types/userTypes'
import { ApiMessage } from '../utils/ApiMessage'
import { EncryptPassword, FindUserByEmail, VerifyPassword } from '../utils/helper/asyncHelpers'
import { GenerateJwtToken, GenerateOTP, GenerateRandomId } from '../utils/helper/syncHelpers'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

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

        const confirmationUrl = `${config.SERVER_URL}/confirmation/${token}?code=${code}`
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

export const VerifyAccount = async (token: string, code: string): Promise<ApiMessage> => {
    try {
        const user = await userModel.findOne({
            'accountConfirmation.token': token,
            'accountConfirmation.code': code
        })
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
        user.accountConfirmation.status = true
        user.accountConfirmation.timestamp = dayjs().utc().toDate()
        await user.save()

        const to = [user.emailAddress]
        const subject = 'Welcome to Worknest: Account verified'
        const HTML = verificationSuccessfullTemplate()
        await sendEmail(to, subject, HTML)

        return {
            success: true,
            status: 200,
            message: 'Email verified',
            data: null
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

export const LoginUser = async (input: UserLoginDTO): Promise<ApiMessage> => {
    const { emailAddress, password } = input
    try {
        const user = await FindUserByEmail(emailAddress, `+password`)
        if (!user) {
            return {
                success: false,
                status: 422,
                message: responseMessage.NOT_FOUND('user'),
                data: null
            }
        }
        const isPasswordCorrect = await VerifyPassword(password, user.password)
        if (!isPasswordCorrect) {
            return {
                success: false,
                status: 400,
                message: responseMessage.INVALID_LOGIN_CREDENTIALS,
                data: null
            }
        }

        const accessToken = GenerateJwtToken(
            {
                userId: user.id as string,
                name: user.name,
                role: user.role
            },
            config.ACCESS_TOKEN.SECRET as string,
            config.ACCESS_TOKEN.EXPIRY
        )

        const refreshToken = GenerateJwtToken(
            {
                userId: user.id as string
            },
            config.REFRESH_TOKEN.SECRET as string,
            config.REFRESH_TOKEN.EXPIRY
        )
        
        user.lastLoginAt = dayjs().utc().toDate()
        await user.save()

        const payload: IRefreshToken = {
            token: accessToken
        }

        await refreshTokenModel.create(payload)

        return {
            success: true,
            status: 200,
            message: responseMessage.LOGIN,
            data: {
                user: {
                    id: user.id as string,
                    name: user.name,
                    emailAddress: user.emailAddress
                },
                accessToken: accessToken,
                refreshToken: refreshToken
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
