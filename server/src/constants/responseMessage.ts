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
    UNAUTHORIZED: 'You are not authorized to perform this action'
}
