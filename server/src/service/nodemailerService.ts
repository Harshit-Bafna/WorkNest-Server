import nodemailer from 'nodemailer'
import config from '../config/config'
import logger from '../utils/logger'

const senderName: string = config.SENDER_NAME || 'Sender Name'
const senderHost: string = config.SENDER_HOST || 'smtp.gmail.com'
const senderPort: number = config.SENDER_PORT ? parseInt(config.SENDER_PORT, 10) : 587
const isSenderSecure: boolean = config.IS_SENDER_SECURE === 'true'
const senderEmail: string = config.SENDER_EMAIL || ''
const senderEmailPassword: string = config.SENDER_EMAIL_PASSWORD || ''

const transporter = nodemailer.createTransport({
    host: senderHost,
    port: senderPort,
    secure: isSenderSecure,
    auth: {
        user: senderEmail,
        pass: senderEmailPassword
    }
})

interface EmailAttachment {
    filename: string
    path: string
    cid?: string | undefined
}

export const sendEmail = async (to: string[], subject: string, html: string, attatchments: EmailAttachment[] = []) => {
    try {
        const info = await transporter.sendMail({
            from: `"${senderName}" <${senderEmail}>`,
            to: to,
            subject: subject,
            html: html,
            attachments: attatchments
        })

        return info
    } catch (error) {
        logger.error('EMAIL_SERVICE', {
            meta: error
        })
        throw new Error(`Error sending email: ${error as string}`)
    }
}
