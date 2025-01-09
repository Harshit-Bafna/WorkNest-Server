import dotenvFlow from 'dotenv-flow'

dotenvFlow.config()

export default {
    ENV: process.env.ENV,
    PORT: process.env.PORT,
    SERVER_URL: process.env.SERVER_URL,
    CLIENT_URL: process.env.CLIENT_URL,

    DATABASE_URL: process.env.DATABASE_URL,

    BUCKET_NAME: process.env.BUCKET_NAME,
    BUCKET_REGION: process.env.BUCKET_REGION,
    ACCESS_KEY: process.env.ACCESS_KEY,
    SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY,

    SENDER_HOST: process.env.SENDER_HOST,
    SENDER_PORT: process.env.SENDER_PORT,
    IS_SENDER_SECURE: process.env.IS_SENDER_SECURE,
    SENDER_NAME: process.env.SENDER_NAME,
    SENDER_EMAIL: process.env.SENDER_EMAIL,
    SENDER_EMAIL_PASSWORD: process.env.SENDER_EMAIL_PASSWORD,

    ACCESS_TOKEN: {
        SECRET: process.env.ACCESS_TOKEN_SECRET,
        EXPIRY: 60 * 60
    },

    REFRESH_TOKEN: {
        SECRET: process.env.REFRESH_TOKEN_SECRET,
        EXPIRY: 60 * 60 * 24
    }
}
