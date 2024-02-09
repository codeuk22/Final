export class ApiError extends Error {

    [x: string]: any

    constructor(statusCode: any, message = "Something went wrong", errors = [], stack="") {

        super()

        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}