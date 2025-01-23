import { EUserRole } from '../constants/Enums/applicationEnums'
import responseMessage from '../constants/responseMessage'
import organisationModel from '../model/user/organisationModel'
import userModel from '../model/user/userModel'
import { ApiMessage } from '../utils/ApiMessage'

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
