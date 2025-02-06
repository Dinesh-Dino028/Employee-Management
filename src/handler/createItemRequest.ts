import { createItem } from "../dynamodb/dynamodb";
import { IllegalArgumentError, EmployeeValidationError } from "../helper/errorList";

export const createItemRequest = async (requestBody: string): Promise<any> => {
    try {
        const itemDetails: Employee = JSON.parse(requestBody);
        if (itemDetails.name === undefined || itemDetails.email === undefined || itemDetails.phone === undefined || itemDetails.department === undefined || itemDetails.designation === undefined) {
            throw new IllegalArgumentError('Missing item details');
        }
        const createdItem = await createItem(itemDetails);
        return {
            statusCode: 201,
            body: JSON.stringify(createdItem)
        };
    } catch (error) {
        if (error instanceof Error) {
            throw new EmployeeValidationError(error.message);
        } else {
            throw new EmployeeValidationError("An unknown error occurred");
        }
    }
}