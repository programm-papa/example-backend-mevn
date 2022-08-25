module.exports = class ApiError extends Error {
    status;
    errors;

    constructor(status, errorType, message, errors = []) {
        super(message);
        this.status = status;
        this.errors = errors;
        this.errorType = errorType;
    }

    static BadRequest(status, errorType, message, errors = []) {
        return new ApiError(status, errorType, message, errors);
    }
}