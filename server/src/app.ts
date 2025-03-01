import express, { Application, Request, Response, NextFunction } from 'express'
import path from 'path'
import globalErrorHandler from './middleware/globalErrorHandler'
import responseMessage from './constants/responseMessage'
import ApiError from './utils/ApiError'
import helmet from 'helmet'
import cors from 'cors'
import config from './config/config'
import cookieParser from 'cookie-parser'

import authentication from './middleware/authentication'

import healthRouter from './router/healthCheck'
import awsRouter from './router/s3FileHandler'
import authRouter from './router/auth'
import organisationRouter from './router/organisation'
import projectRouter from './router/projects'
import userRouter from './router/user'
import taskRouter from './router/task'

const app: Application = express()

//Middlewares
app.use(helmet())
app.use(cookieParser())
app.use(
    cors({
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
        origin: [config.CLIENT_URL as string],
        credentials: true
    })
)
app.use(express.json())
app.use(express.static(path.join(__dirname, '../', 'public')))

// Network route
app.get('/ping', (res: Response) => {
    res.status(200).json({ status: 200, success: true, message: 'Server is running!', data: null })
})

// Open Routes
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/organisation', organisationRouter)
app.use('/api/v1/s3', awsRouter)

// Restricted Routes
app.use(authentication)
app.use('/api/v1/health', healthRouter)
app.use('/api/v1/project', projectRouter)
app.use('/api/v1/user', userRouter)
app.use('/api/v1/task', taskRouter)

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
