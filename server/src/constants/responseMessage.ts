export default {
    SUCCESS: `The operation has been successful`,
    SOMETHING_WENT_WRONG: 'Something Went Wrong',
    NOT_FOUND: (entity: string) => `${entity} Not Found`,
    TOO_MANY_REQUESTS: 'Too many request',
    INTERNAL_SERVER_ERROR: 'Internal Server Error',
    ALREADY_EXISTS: (entity: string, identifier: string) => {
        return `${entity} with ${identifier} already exists`
    },
    PASSWORD_ENCRYPTION_ERROR: 'An unknown error occurred while encrypting the password',
    PASSWORD_VERIFICATION_ERROR: 'An unknown error occurred while verifying the password',
    ERROR_FETCHING: (entity: string, identifier: string) => {
        return `Error while fetching ${entity} with ${identifier}`
    },
    INVALID_CONFIRMATION_LINK: 'Invalid confirmation token or code',
    ACCOUNT_ALREADY_CONFIRMED: 'Account already confirmed',
    LOGIN: 'User logged in successfully',
    INVALID_LOGIN_CREDENTIALS: 'Invalid credentials',
    UNAUTHORIZED: 'You are not authorized to perform this action',
    LOGOUT: 'User logged out successfully',
    FOUND: (entity: string) => `${entity} found`,
    INVALID_TOKEN: 'Token is invalid',
    IS_REQUIRED: (entity: string) => `${entity} is required`,
    ACCOUNT_CONFIRMATION_REQUIRED: 'Account confirmation is required to perform this action',
    RESET_PASSWORD_LINK_SENT: 'Reset password link sent',
    LINK_EXPIRED: 'Link expired',
    INVALID_REQUEST: 'Your request is invalid',
    PASSWORD_RESET_SUCCESSFULLY: 'Password reset successfully',
    WRONG_OLD_PASSWORD: 'Invalid old password',
    PASSWORD_NOT_MATCH: 'New password and confirm password must match',
    OLD_NEW_PASSWORD_SAME: 'New password does not match with new password',
    PASSWORD_CHANGED: 'Password changed successfully'
}
