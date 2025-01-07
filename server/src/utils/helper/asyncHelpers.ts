import responseMessage from '../../constants/responseMessage'
import userModel from '../../model/userModel'
import { IUser } from '../../types/userTypes'
import argon2 from 'argon2'

export const FindUserByEmail = async (email: string): Promise<IUser | null> => {
    try {
        const user = await userModel.findOne({ emailAddress: email })
        return user
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : responseMessage.ERROR_FETCHING('User', 'email')
        throw new Error(`Error finding user by email: ${errorMessage}`)
    }
}

export const EncryptPassword = async (password: string): Promise<string> => {
    try {
        const hashedPassword = await argon2.hash(password)
        return hashedPassword
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : responseMessage.PASSWORD_ENCRYPTION_ERROR
        throw new Error(errorMessage)
    }
}
