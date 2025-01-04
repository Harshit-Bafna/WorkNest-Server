import os from 'os'
import config from '../config/config'
import { ApiMessage } from '../utils/ApiMessage'
import responseMessage from '../constants/responseMessage'

export const getHealth = (): ApiMessage => {
    try {
        const getSystemHealth = {
            cpuUsage: os.loadavg(),
            totalMemory: `${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`,
            freeMemory: `${(os.freemem() / 1024 / 1024).toFixed(2)} MB`
        }

        const getApplicationHealth = {
            environment: config.ENV,
            uptime: `${process.uptime().toFixed(2)} Second`,
            memoryUsage: {
                heapTotal: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`,
                heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`
            }
        }

        const healthData = {
            application: getApplicationHealth,
            system: getSystemHealth,
            timestamp: Date.now()
        }
        return {
            success: true,
            status: 200,
            message: 'System health data fetched',
            data: healthData
        }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : responseMessage.SOMETHING_WENT_WRONG
        return {
            success: false,
            status: 500,
            message: errorMessage
        }
    }
}
