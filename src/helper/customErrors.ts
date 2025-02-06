import { EmployeeValidationError, ItemNotFoundError } from "./errorList"

export const customErrors = (err: Error) => {
    if (err instanceof ItemNotFoundError) {
        return {
            statusCode: 404,
            body: JSON.stringify({
                message: 'Item not found',
                error: err.message
            })
        };
    }
    if (err instanceof EmployeeValidationError) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'EmployeeValidationError',
                error: err.message
            })
        };
    }
    return {
        statusCode: 500,
        body: JSON.stringify({
            message: 'Internal Server Error',
            error: err.message
        })
    };
}