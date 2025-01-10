import config from '../config/config'
import { UserChangePasswordDTO } from '../constants/DTO/User/ChangePasswordDTO'
import { UserResetPasswordDTO } from '../constants/DTO/User/ResetPasswordDTO'
import { UserLoginDTO } from '../constants/DTO/User/UserLoginDTO'
import { UserRegistrationDTO } from '../constants/DTO/User/UserRegistrationDTO'
import responseMessage from '../constants/responseMessage'
import { emailVerificationTemplate } from '../constants/template/emailVerificationTemplate'
import { forgotPasswordTemplate } from '../constants/template/forgotPasswordTemplate'
import { passwordResetSuccessTemplate } from '../constants/template/passwordResetSuccessTemplate'
import { verificationSuccessfullTemplate } from '../constants/template/verificationSuccessfullTemplate'
import refreshTokenModel from '../model/user/refreshTokenModel'
import userModel from '../model/user/userModel'
import { sendEmail } from '../service/nodemailerService'
import { IDecryptedJwt, IRefreshToken, IUser } from '../types/userTypes'
import { ApiMessage } from '../utils/ApiMessage'
import { EncryptPassword, FindUserByEmail, VerifyPassword } from '../utils/helper/asyncHelpers'
import { GenerateJwtToken, GenerateOTP, GenerateRandomId, GenerateResetPasswordExpiry, VerifyToken } from '../utils/helper/syncHelpers'
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
            token: refreshToken
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

export const LogoutUser = async (refreshToken: string | undefined): Promise<ApiMessage> => {
    try {
        if (refreshToken) {
            await refreshTokenModel.deleteOne({ token: refreshToken })
        }

        return {
            success: true,
            status: 200,
            message: responseMessage.LOGOUT,
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

export const RefreshToken = async (refreshToken: string | undefined): Promise<ApiMessage> => {
    try {
        if (!refreshToken) {
            return {
                success: false,
                status: 401,
                message: responseMessage.NOT_FOUND('Refresh token'),
                data: null
            }
        }

        const rft = await refreshTokenModel.findOne({ token: refreshToken })
        if (!rft) {
            return {
                success: false,
                status: 401,
                message: responseMessage.INVALID_TOKEN,
                data: null
            }
        }

        const { userId } = VerifyToken(refreshToken, config.REFRESH_TOKEN.SECRET as string) as IDecryptedJwt
        const user = await userModel.findById(userId)

        if (!user) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED,
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

        return {
            success: true,
            status: 200,
            message: responseMessage.FOUND('Refresh token'),
            data: {
                accessToken: accessToken
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

export const ForgotPassword = async (emailAddress: string): Promise<ApiMessage> => {
    try {
        const user = await userModel.findOne({ emailAddress: emailAddress })
        if (!user) {
            return {
                success: true,
                status: 404,
                message: responseMessage.NOT_FOUND('User'),
                data: null
            }
        }

        if (!user.accountConfirmation.status) {
            return {
                success: true,
                status: 400,
                message: responseMessage.ACCOUNT_CONFIRMATION_REQUIRED,
                data: null
            }
        }

        const token = GenerateRandomId()
        const expiry = GenerateResetPasswordExpiry(15)

        user.passwordReset.token = token
        user.passwordReset.expiry = expiry
        await user.save()

        const resetLink = `${config.CLIENT_URL}/reset-password/${token}`
        const to = [emailAddress]
        const subject = 'Password reset request'
        const HTML = forgotPasswordTemplate(resetLink)
        await sendEmail(to, subject, HTML)

        return {
            success: true,
            status: 200,
            message: responseMessage.RESET_PASSWORD_LINK_SENT,
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

export const ResetPasseord = async (token: string, input: UserResetPasswordDTO): Promise<ApiMessage> => {
    const password = input.newPassword
    try {
        const user = await userModel.findOne({ 'passwordReset.token': token })
        if (!user) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('User'),
                data: null
            }
        }

        if (!user.accountConfirmation.status) {
            return {
                success: true,
                status: 400,
                message: responseMessage.ACCOUNT_CONFIRMATION_REQUIRED,
                data: null
            }
        }

        const storedExpiry = user.passwordReset.expiry
        const currentTimestamp = dayjs().valueOf()

        if (!storedExpiry) {
            return {
                success: true,
                status: 400,
                message: responseMessage.INVALID_REQUEST,
                data: null
            }
        }

        if (currentTimestamp > storedExpiry) {
            return {
                success: true,
                status: 400,
                message: responseMessage.LINK_EXPIRED,
                data: null
            }
        }

        const hashedPassword = await EncryptPassword(password)
        user.password = hashedPassword
        user.passwordReset.token = null
        user.passwordReset.expiry = null
        user.passwordReset.lastResetAt = dayjs().utc().toDate()
        await user.save()

        const to = [user.emailAddress]
        const subject = 'Password reset successful'
        const HTML = passwordResetSuccessTemplate()
        await sendEmail(to, subject, HTML)

        return {
            success: true,
            status: 200,
            message: responseMessage.PASSWORD_RESET_SUCCESSFULLY,
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

export const ChangePassword = async (accessToken: string, input: UserChangePasswordDTO): Promise<ApiMessage> => {
    const { oldPassword, newPassword, confirmPassword } = input
    try {
        const { userId } = VerifyToken(accessToken, config.ACCESS_TOKEN.SECRET as string) as IDecryptedJwt
        const user = await userModel.findById(userId).select('+password')
        if (!user) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED,
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
        await user.save()

        const to = [user.emailAddress]
        const subject = 'Password change successfully'
        const HTML = passwordResetSuccessTemplate()
        await sendEmail(to, subject, HTML)

        return {
            success: true,
            status: 200,
            message: responseMessage.PASSWORD_CHANGED,
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
