import { PutObjectCommand, ListObjectsV2Command, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import S3 from '../service/awsService'
import config from '../config/config'
import sharp from 'sharp'
import { ApiMessage } from '../utils/ApiMessage'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export interface UploadParams {
    folderName: string
    fileName: string
    file: Express.Multer.File
}

export const uploadToAWS = async (input: UploadParams): Promise<ApiMessage> => {
    const folderName = input.folderName
    const fileName = input.fileName
    const file = input.file

    const bucketName = config.BUCKET_NAME as string
    const bucketRegion = config.BUCKET_REGION as string

    const height = 1920
    const width = 1080
    const fit = 'contain'

    try {
        const Buffer = await sharp(file.buffer).resize({ height: height, width: width, fit: fit }).toBuffer()

        const listCommand = new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: `${folderName}/`,
            MaxKeys: 1
        })

        const listResponse = await S3.send(listCommand)

        if (!listResponse.Contents || listResponse.Contents.length === 0) {
            const createFolderCommand = new PutObjectCommand({
                Bucket: bucketName,
                Key: `${folderName}/`,
                Body: ''
            })
            await S3.send(createFolderCommand)
        }

        const uploadParams = {
            Bucket: bucketName,
            Key: `${folderName}/${fileName}`,
            Body: Buffer,
            ContentType: file.mimetype
        }

        const uploadCommand = new PutObjectCommand(uploadParams)
        await S3.send(uploadCommand)

        const fileUrl = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${folderName}/${fileName}`
        return {
            success: true,
            status: 200,
            message: 'File uploaded successfully',
            data: {
                fileUrl
            }
        }
    } catch (error) {
        return {
            success: false,
            status: 500,
            message: `Error uploading file: ${error as string}`
        }
    }
}

export const getSignedFileURL = async (key: string): Promise<ApiMessage> => {
    try {
        const getObjectCommand = {
            Bucket: config.BUCKET_NAME as string,
            Key: key
        }

        const command = new GetObjectCommand(getObjectCommand)
        const url = await getSignedUrl(S3, command, { expiresIn: 600 })

        return {
            success: true,
            status: 200,
            message: 'Signed URL fetched successfully',
            data: {
                url
            }
        }
    } catch (error) {
        return {
            success: false,
            status: 500,
            message: `Error getting signed URL: ${error as string}`
        }
    }
}

export const deleteFilefromAWS = async (key: string): Promise<ApiMessage> => {
    const bucketName = config.BUCKET_NAME as string
    try {
        const deleteParams = {
            Bucket: bucketName,
            Key: key
        }

        const deleteCommand = new DeleteObjectCommand(deleteParams)
        await S3.send(deleteCommand)

        return {
            success: true,
            status: 200,
            message: 'File deleted successfully',
            data: null
        }
    } catch (error) {
        return {
            success: false,
            status: 500,
            message: `Error deleting file: ${error as string}`
        }
    }
}
