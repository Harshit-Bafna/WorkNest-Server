import { createLogger, format, transports } from 'winston'
import { ConsoleTransportInstance, FileTransportInstance } from 'winston/lib/winston/transports'
import util from 'util'
import { EApplicationEnvironment } from '../constants/application'
import config from '../config/config'
import path from 'path'

// Linking Trace Support
import * as sourceMapSupport from 'source-map-support'
sourceMapSupport.install()

const ConsoleLogFormat = format.printf((info) => {
    const { level, message, timestamp, meta = {} } = info

    const customeLevel = level.toUpperCase()
    const customTimeStamp = timestamp as string
    const customMessage = message

    const customeMeta = util.inspect(meta, {
        showHidden: false,
        depth: null
    })

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const customeLog = `${customeLevel} [${customTimeStamp}] ${customMessage}\n${'META'} ${customeMeta}\n`

    return customeLog
})

const ConsoleFileFormat = format.printf((info) => {
    const { level, message, timestamp, meta = {} } = info

    const logMeta: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(meta as Record<string, unknown>)) {
        if (value instanceof Error) {
            logMeta[key] = {
                name: value.name,
                message: value.message,
                trace: value.stack || ''
            }
        } else {
            logMeta[key] = value
        }
    }

    const logData = {
        level: level.toUpperCase(),
        message,
        timestamp,
        meta: logMeta
    }

    return JSON.stringify(logData, null, 4)
})

const consoleTransport = (): Array<ConsoleTransportInstance> => {
    if (config.ENV === EApplicationEnvironment.DEVELOPMENT) {
        return [
            new transports.Console({
                level: 'info',
                format: format.combine(format.timestamp(), ConsoleLogFormat)
            })
        ]
    }
    return []
}

const FileTransport = (): Array<FileTransportInstance> => {
    return [
        new transports.File({
            filename: path.join(__dirname, '../', '../', 'logs', `${config.ENV}.log`),
            level: 'info',
            format: format.combine(format.timestamp(), ConsoleFileFormat)
        })
    ]
}

export default createLogger({
    defaultMeta: {
        meta: {}
    },
    transports: [...FileTransport(), ...consoleTransport()]
})
