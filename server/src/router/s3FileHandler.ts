import { uploadToAWS, getSignedFileURL, deleteFilefromAWS, UploadParams } from '../controller/s3FileHandler'
import multerService from '../service/multerService'
import ApiError from '../utils/ApiError'
import ApiResponse from '../utils/ApiResponse'
import { Router, Request, Response, NextFunction } from 'express'
const router = Router()

/*
    Route: /api/v1/s3/upload
    Method: POST
    Desc: Uploads a file to AWS S3 bucket
    Access: Protected
    Body: file, fileName, folderName
*/
router.post('/upload', multerService.single('file'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const file = req.file as Express.Multer.File
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const fileName = req.body.fileName as string
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const folderName = req.body.folderName as string
        const uploadParams: UploadParams = { folderName, fileName, file }

        const uploadData = await uploadToAWS(uploadParams)
        if (!uploadData.success) {
            return ApiError(next, null, req, uploadData.status, uploadData.message)
        }
        return ApiResponse(req, res, uploadData.status, uploadData.message, uploadData.data)
    } catch (err) {
        return ApiError(next, err, req, 500)
    }
})

/*
    Route: /api/v1/s3/getSignedUrl
    Method: GET
    Desc: Returns a signed URL for a file in AWS S3 bucket
    Access: Protected
    Query: key
*/
router.get('/getSignedUrl/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const key = req.query.key as string
        const signedUrlData = await getSignedFileURL(key)
        if (!signedUrlData.success) {
            return ApiError(next, null, req, signedUrlData.status, signedUrlData.message)
        }
        return ApiResponse(req, res, signedUrlData.status, signedUrlData.message, signedUrlData.data)
    } catch (error) {
        return ApiError(next, error, req, 500)
    }
})

/*
    Route: /api/v1/s3/deleteFile
    Method: DELETE
    Desc: Deletes a file from AWS S3 bucket
    Access: Protected
    Query: key
*/
router.delete('/deleteFile/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const key = req.query.key as string
        const deleteData = await deleteFilefromAWS(key)
        if (!deleteData.success) {
            return ApiError(next, null, req, deleteData.status, deleteData.message)
        }
        return ApiResponse(req, res, deleteData.status, deleteData.message, deleteData.data)
    } catch (error) {
        return ApiError(next, error, req, 500)
    }
})

export default router
