export class ApiResponse {

    [x: string]: any

    constructor(statusCode: number, data: any, message: string = "Success") {

        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400

    }
}
