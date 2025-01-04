import { S3Client } from '@aws-sdk/client-s3'
import config from '../config/config'

// const bucketName = config.BUCKET_NAME
const bucketRegion = config.BUCKET_REGION as string
const accessKey = config.ACCESS_KEY as string
const secretAccessKey = config.SECRET_ACCESS_KEY as string

const S3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey
    },
    region: bucketRegion
})

export default S3
