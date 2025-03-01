import { UserBasicInfoDTO } from '../constants/DTO/User/UserProfile/UserBasicInfoDTO'
import { EUserRole } from '../constants/Enums/applicationEnums'
import responseMessage from '../constants/responseMessage'
import organisationModel from '../model/user/organisationModel'
import userModel from '../model/user/userModel'
import { IUserEducation, IUserProfession } from '../types/userTypes'
import { ApiMessage } from '../utils/ApiMessage'
import userBasicInfoModel from '../model/user/userProfile/userBasicInfoModel'
import { CreateUserEducationDTO } from '../constants/DTO/User/UserProfile/CreateUserEducationDTO'
import userEducationModel from '../model/user/userProfile/userEducationModel'
import mongoose from 'mongoose'
import { CreateUserProfessionDTO } from '../constants/DTO/User/UserProfile/CreateUserProfessionDTO'
import userProfessionalModel from '../model/user/userProfile/userProfessionalModel'

export const GetAllUser = async (userId: string, page: number, limit: number, search: string | null): Promise<ApiMessage> => {
    const skip = (page - 1) * limit
    try {
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
            [EUserRole.ADMIN]: { role: { $ne: EUserRole.MASTER_ADMIN } },
            [EUserRole.ORGANISATION_ADMIN]: {
                'organisation.organisationId': user.organisation.organisationId
            }
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

        const totalCount = await userModel.countDocuments(query)
        const users = await userModel.find(query, 'name emailAddress role organisation accountConfirmation consent').skip(skip).limit(limit)

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                users: users,
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

export const GetUserDetails = async (userId: string, loggedInUserId: string): Promise<ApiMessage> => {
    try {
        userId = userId || loggedInUserId

        const [user, loggedInUser] = await Promise.all([userModel.findById(userId), userModel.findById(loggedInUserId)])

        if (!user || !loggedInUser) {
            const notFoundEntity = !user ? 'User' : 'Logged-in user'
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND(notFoundEntity),
                data: null
            }
        }

        const isUnauthorized =
            ((loggedInUser.role === EUserRole.MANAGER || loggedInUser.role === EUserRole.ORGANISATION_USER || loggedInUser.role === EUserRole.USER) &&
                userId !== loggedInUserId) ||
            (loggedInUser.role === EUserRole.ORGANISATION_ADMIN &&
                ![EUserRole.ORGANISATION_USER, EUserRole.ORGANISATION_ADMIN].includes(user.role)) ||
            (loggedInUser.role === EUserRole.ADMIN && user.role !== EUserRole.MASTER_ADMIN)

        if (isUnauthorized) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        }

        let organisation = null
        if (user.organisation.isAssociated) {
            organisation = await organisationModel.findById(user.organisation.organisationId)
            if (!organisation) {
                return {
                    success: false,
                    status: 404,
                    message: responseMessage.NOT_FOUND('Organization'),
                    data: null
                }
            }
        }

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                user,
                organisation,
                requestedBy: loggedInUserId
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

export const UpdateBasicInfo = async (input: UserBasicInfoDTO, userId: string): Promise<ApiMessage> => {
    const { bio, socialLinks } = input
    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('User'),
                data: null
            }
        }

        const userBasicInfo = await userBasicInfoModel.findOne({
            userId: user.id
        })
        if (!userBasicInfo) {
            throw new Error()
        }

        if (bio) {
            userBasicInfo.bio = bio
            await userBasicInfo.save()

            return {
                success: true,
                status: 200,
                message: responseMessage.SUCCESS,
                data: {
                    bio: bio
                }
            }
        } else if (socialLinks) {
            const index = userBasicInfo.socialLinks.findIndex((link) => link.platform === socialLinks.platform)

            if (index !== -1) {
                userBasicInfo.socialLinks[index] = socialLinks
            } else {
                userBasicInfo.socialLinks.push(socialLinks)
            }

            await userBasicInfo.save()

            return {
                success: true,
                status: 200,
                message: responseMessage.SUCCESS,
                data: {
                    socialLinks: socialLinks
                }
            }
        } else {
            throw new Error()
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

export const CreateUserEducation = async (input: CreateUserEducationDTO, userId: string): Promise<ApiMessage> => {
    const { institutionName, degree, grade, startDate, endDate, isPresent } = input

    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('User'),
                data: null
            }
        }

        const payload: IUserEducation = {
            userId: user.id as unknown as mongoose.Schema.Types.ObjectId,
            institutionName: institutionName,
            degree: degree,
            grade: {
                type: grade.type,
                value: grade.value
            },
            startDate: startDate,
            endDate: endDate,
            isPresent: isPresent
        }

        const userEducation = await userEducationModel.create(payload)

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                education: userEducation
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

export const GetAllUserEducation = async (userId: string): Promise<ApiMessage> => {
    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('User'),
                data: null
            }
        }

        const userEducation = await userEducationModel.find({
            userId: userId
        })

        const totalCount = await userEducationModel.countDocuments({
            userId: userId
        })

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                userEducation: userEducation,
                totalCount: totalCount
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

export const UpdateUserEducation = async (input: Partial<CreateUserEducationDTO>, educationId: string, userId: string): Promise<ApiMessage> => {
    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('User'),
                data: null
            }
        }

        let userEducation = await userEducationModel.findById(educationId)
        if (!userEducation) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('User Education'),
                data: null
            }
        }
        if (user.id != userEducation.userId) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        }

        userEducation = await userEducationModel.findByIdAndUpdate(
            educationId,
            input,
            { new: true }
        )
        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                userEducation: userEducation
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

export const DeleteUserEducation = async (userEducationId: string, userId: string): Promise<ApiMessage> => {
    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('User'),
                data: null
            }
        }

        const userEducation = await userEducationModel.findById(userEducationId)
        if (!userEducation) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('User Education'),
                data: null
            }
        }
        if (user.id != userEducation.userId) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        }

        await userEducation.deleteOne()

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
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

export const CreateUserProfession = async (input: CreateUserProfessionDTO, userId: string): Promise<ApiMessage> => {
    const { organizationName, role, position, startDate, endDate, isPresent } = input
    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('User'),
                data: null
            }
        }

        const payload: IUserProfession = {
            userId: user.id as unknown as mongoose.Schema.Types.ObjectId,
            organizationName: organizationName,
            role: role,
            position: position,
            startDate: startDate,
            endDate: endDate,
            isPresent: isPresent
        }

        const userProfession = await userProfessionalModel.create(payload)

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                profession: userProfession
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

export const GetAllUserProfession = async (userId: string): Promise<ApiMessage> => {
    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('User'),
                data: null
            }
        }

        const userProfession = await userProfessionalModel.find({
            userId: userId
        })

        const totalCount = await userProfessionalModel.countDocuments({
            userId: userId
        })

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                userProfession: userProfession,
                totalCount: totalCount
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

export const UpdateUserProfession = async (input: Partial<CreateUserProfessionDTO>, professionId: string, userId: string): Promise<ApiMessage> => {
    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('User'),
                data: null
            }
        }

        let userProfession = await userProfessionalModel.findById(professionId)
        if (!userProfession) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('User Education'),
                data: null
            }
        }
        if (user.id != userProfession.userId) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        }

        userProfession = await userProfessionalModel.findByIdAndUpdate(
            professionId,
            input,
            { new: true }
        )
        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
            data: {
                userProfession: userProfession
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

export const DeleteUserProfession = async (professionId: string, userId: string): Promise<ApiMessage> => {
    try {
        const user = await userModel.findById(userId)
        if (!user) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('User'),
                data: null
            }
        }

        const userProfession = await userProfessionalModel.findById(professionId)
        if (!userProfession) {
            return {
                success: false,
                status: 404,
                message: responseMessage.NOT_FOUND('User Education'),
                data: null
            }
        }
        if (user.id != userProfession.userId) {
            return {
                success: false,
                status: 401,
                message: responseMessage.UNAUTHORIZED,
                data: null
            }
        }

        await userProfession.deleteOne()

        return {
            success: true,
            status: 200,
            message: responseMessage.SUCCESS,
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