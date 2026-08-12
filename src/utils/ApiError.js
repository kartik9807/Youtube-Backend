class ApiError extends Error{
    constructor(
        statusCode,
        message="something went wrong",
        errors = [],
        stack = "",
    ){
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;
        if(stack){
            this.stack = stack;
        }else{
            Error.captureStackTrace(this,this.constructor);
        }
    }
}
module.exports = ApiError;


//? depth of this class
// class ApiError extends Error — this makes ApiError a real JavaScript Error subclass, not just a plain object. This matters because things like throw new ApiError(...), err instanceof Error, and stack traces all work naturally, exactly like a built-in error.
// super(message) — calls the parent Error constructor with message. This sets up err.message and initializes the native error machinery (stack trace support, .name, etc.) before you add your own fields.
// this.statusCode = statusCode — an HTTP status code (400, 401, 404, 500, etc.) attached directly onto the error object. This is the key industry trick: instead of guessing what status to send in your error middleware, the error carries its own status code.
// this.data = null — kept null on purpose, to mirror the shape of ApiResponse (success responses have data, errors don't). This makes both classes structurally consistent on the frontend/client side.
// this.message = message — redundant-looking (since super(message) already set it), but explicitly reassigning it here guarantees it shows up as an own enumerable property, so it serializes properly with JSON.stringify() (native Error.message is non-enumerable by default and gets silently dropped in JSON.stringify).
// this.success = false — a flag so the client can just check response.success instead of inspecting status codes.
// this.errors = errors — an array for detailed validation errors (e.g., multiple invalid form fields at once), separate from the single top-level message.
// Error.captureStackTrace(this, this.constructor) — if no custom stack was passed in, this generates a clean stack trace starting from where the error was thrown, and excludes the ApiError constructor itself from cluttering the trace. This is a V8-specific method (works in Node.js) used to keep stack traces readable.