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
    ERROR_FETCHING: (entity: string, identifier: string) => {
        return `Error while fetching ${entity} with ${identifier}`
    }
}
