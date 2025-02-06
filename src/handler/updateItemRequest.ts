import { updateItem } from "../dynamodb/dynamodb";
import { IllegalArgumentError, EmployeeValidationError } from "../helper/errorList";

export const updateItemRequest = async (id: string, requestBody: string): Promise<any> => {
    try {
        const itemDetails: EmployeeUpdate = JSON.parse(requestBody);
        if (itemDetails.name === undefined || itemDetails.email === undefined || itemDetails.phone === undefined || itemDetails.department === undefined || itemDetails.designation === undefined) {
            throw new IllegalArgumentError('Missing item details');
        }
        const updatedItem = await updateItem(id, itemDetails);
        return {
            statusCode: 200,
            body: JSON.stringify(updatedItem)
        };
    } catch (error) {
        if (error instanceof Error) {
            throw new EmployeeValidationError(error.message);
        } else {
            throw new EmployeeValidationError("An unknown error occurred");
        }
    }
}