import express, { Application, Request, Response, NextFunction } from 'express'
import path from 'path'
import globalErrorHandler from './middleware/globalErrorHandler'
import responseMessage from './constants/responseMessage'
import ApiError from './utils/ApiError'
import helmet from 'helmet'
import cors from 'cors'
import config from './config/config'

import rateLimit from './middleware/rateLimit'

import healthRouter from './router/healthCheck'
import awsRouter from './router/s3FileHandler'
import userRouter from './router/user'

const app: Application = express()

//Middlewares
app.use(helmet())
app.use(
    cors({
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
        origin: [config.CLIENT_URL as string],
        credentials: true
    })
)
app.use(express.json())
app.use(express.static(path.join(__dirname, '../', 'public')))

// Routes
app.use(rateLimit)
app.use('/api/v1/health', healthRouter)
app.use('/api/v1/s3', awsRouter)
app.use('/api/v1/user', userRouter)

// 404 hander
app.use((req: Request, _: Response, next: NextFunction) => {
    try {
        throw new Error(responseMessage.NOT_FOUND('Route'))
    } catch (error) {
        ApiError(next, error, req, 404)
    }
})

// Global Error Handler
app.use(globalErrorHandler)

export default app
