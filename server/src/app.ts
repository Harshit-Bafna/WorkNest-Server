import express, { Application, Request, Response, NextFunction } from 'express'
import path from 'path';
import globalErrorHandler from './middleware/globalErrorHandler';
import responseMessage from './constants/responseMessage';
import ApiError from './utils/ApiError';
import healthRouter from './router/healthCheck';

const app:Application = express()

//Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, '../', 'public')));

// Routes
app.use('/api/v1/health', healthRouter)

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