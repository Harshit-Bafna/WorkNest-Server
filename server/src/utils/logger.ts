import { createLogger, format, transports } from 'winston'
import { ConsoleTransportInstance, FileTransportInstance } from 'winston/lib/winston/transports'
import util from 'util'
import 'winston-mongodb'
import { EApplicationEnvironment } from '../constants/applicationEnums'
import config from '../config/config'
import path from 'path'

// Linking Trace Support
import * as sourceMapSupport from 'source-map-support'
import { red, blue, yellow, green, magenta } from 'colorette'
import { MongoDBTransportInstance } from 'winston-mongodb'
sourceMapSupport.install()

const colorizeLevel = (level: string) => {
    switch (level) {
        case 'ERROR':
            return red(level)
        case 'INFO':
            return blue(level)
        case 'WARN':
            return yellow(level)
        default:
            return level
    }
}

const ConsoleLogFormat = format.printf((info) => {
    const { level, message, timestamp, meta = {} } = info

    const customeLevel = colorizeLevel(level.toUpperCase())
    const customTimeStamp = green(timestamp as string)
    const customMessage = message

    const customeMeta = util.inspect(meta, {
        showHidden: false,
        depth: null,
        colors: true
    })

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const customeLog = `${customeLevel} [${customTimeStamp}] ${customMessage}\n${magenta('META')} ${customeMeta}\n`

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

const MongoDBTransport = (): Array<MongoDBTransportInstance> => {
    return [
        new transports.MongoDB({
            level: 'info',
            db: config.DATABASE_URL as string,
            metaKey: 'meta',
            expireAfterSeconds: 3600 * 24 * 30,
            collection: 'application-logs'
        })
    ]
}

export default createLogger({
    defaultMeta: {
        meta: {}
    },
    transports: [...FileTransport(),...MongoDBTransport(), ...consoleTransport()]
})
