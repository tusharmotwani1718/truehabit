// This file is to handle the API calls, get the request and send response to the user.
class ApiResponse{
    constructor(statusCode, data, message="Success"){
        this.data = data,
        this.message = message,
        this.success = statusCode < 400 // Standard codes of all the success responses all always less than 400.
    }
}

export {ApiResponse}