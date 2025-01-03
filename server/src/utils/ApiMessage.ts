export interface ApiMessage {
    success: boolean
    message: string
    error?: Error
    data?: unknown
    status: number
}
