// All the API Errors will be handled through this class. Although, we can do it manually after making each API call, but this is the more standard and optimizable way to write code.

class ApiError extends Error{
    constructor(
        stausCode,
        message= "Something went wrong", // the default error message, if not sent by the api handle.
        errors = [],
        stack = ""
    ){
        super(message),
        this.stausCode = stausCode >=400, // Standard codes of all the error responses all always less than 400.
        this.data = null, // No data is send since error occurred in API
        this.message = message,
        this.success = false,
        this.errors = errors
    }
}

export {ApiError};