import { APIGatewayProxyResult } from "aws-lambda";
import { deleteItem, getItem } from "../dynamodb/dynamodb";
import { ItemNotFoundError } from "../helper/errorList";

export const deleteItemRequest = async (id: string): Promise<APIGatewayProxyResult> => {
    try {
        const item = await getItem(id);
        await deleteItem(id);
        return {
            statusCode: 200,
            body: JSON.stringify(item)
        };
    } catch (error) {
        console.error('Error:', error);
        if (error instanceof ItemNotFoundError) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'Item not found',
                    error: (error as Error).message
                })
            };

        }
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error',
                error: (error as Error).message
            })
        };
    }
}